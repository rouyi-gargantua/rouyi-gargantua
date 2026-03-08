#!/usr/bin/env python3
"""
关键词提取脚本 - 从Memory文件中提取高频词并生成词频数据
用于动态更新网站关键词图谱
"""

import os
import re
import json
from collections import Counter
from pathlib import Path

# 停用词列表（常见但不具信息量的词）
STOP_WORDS = {
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but',
    'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these',
    'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
    'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'am', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', '的', '了', '在', '是', '我', '有', '和', '就',
    '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说',
    '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这',
    '那', '个', '为', '能', '而', '就', '让', '可以', '吧', '呢',
    '啊', '吗', '得', '地', '着', '过', '些', '还', '把', '被',
    '从', '给', '向', '往', '于', '即', '及', '其', '或', '乃',
    '并且', '以及', '但是', '然而', '因为', '所以', '因此', '如果',
    '即使', '虽然', '尽管', '那么', '然后', '而且', '此外', '另外',
    '加之', '从而', '进而', '反而', '否则', '不然', '要不', '要不然'
}

# 需要特殊处理的概念词（多词组合）
CONCEPTS = [
    '三座塔', '工作之塔', '归因之塔', '感受之塔',
    '卡冈图雅', '平行宇宙', '关键词图谱',
    '智识早餐', '每日复盘', '小酒馆时光',
    '追问协议', '主动发起', '引力波',
    '有限游戏', '无限游戏', ' Connecting the dots',
    '除错玛格丽特', '霓虹金', '深海电鳗',
    '甜甜圈', '黑洞', '光年酒馆'
]

def extract_keywords_from_file(filepath):
    """从单个记忆文件提取关键词"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取中文词汇（2-6个字）
    chinese_words = re.findall(r'[\u4e00-\u9fff]{2,6}', content)
    
    # 提取英文单词
    english_words = re.findall(r'[a-zA-Z]{3,}', content.lower())
    
    # 提取概念词（优先处理）
    concept_matches = []
    for concept in CONCEPTS:
        count = content.count(concept)
        if count > 0:
            concept_matches.extend([concept] * count)
    
    all_words = chinese_words + english_words + concept_matches
    
    # 过滤停用词
    filtered = [w for w in all_words if w.lower() not in STOP_WORDS and len(w) > 1]
    
    return filtered

def calculate_weights(word_counts):
    """计算节点权重（用于图谱节点大小）"""
    max_count = max(word_counts.values()) if word_counts else 1
    
    weights = {}
    for word, count in word_counts.items():
        # 归一化到 10-50 的范围
        weight = 10 + (count / max_count) * 40
        weights[word] = round(weight, 1)
    
    return weights

def generate_connections(words_list, top_words):
    """生成词与词之间的连接关系（共现分析）"""
    connections = []
    top_word_set = set(top_words)
    
    # 滑动窗口共现分析
    window_size = 20
    for i in range(len(words_list) - window_size):
        window = words_list[i:i+window_size]
        window_words = [w for w in window if w in top_word_set]
        
        # 窗口内的词相互连接
        for j in range(len(window_words)):
            for k in range(j+1, len(window_words)):
                connections.append((window_words[j], window_words[k]))
    
    # 统计连接强度
    connection_counts = Counter(connections)
    
    # 生成连接数据
    links = []
    for (source, target), count in connection_counts.most_common(100):
        if count >= 2:  # 至少共现2次
            links.append({
                'source': source,
                'target': target,
                'value': min(count, 10)  # 最大强度为10
            })
    
    return links

def main():
    memory_dir = Path('/workspace/projects/workspace/memory')
    output_dir = Path('/workspace/projects/website/data')
    output_dir.mkdir(exist_ok=True)
    
    # 收集所有记忆文件
    all_words = []
    file_keywords = {}
    
    for memory_file in sorted(memory_dir.glob('2026-03-*.md')):
        words = extract_keywords_from_file(memory_file)
        all_words.extend(words)
        file_keywords[memory_file.stem] = Counter(words).most_common(20)
        print(f"处理: {memory_file.name} - 提取 {len(words)} 个词")
    
    # 统计词频
    word_counts = Counter(all_words)
    
    # 取Top 50关键词
    top_50 = word_counts.most_common(50)
    
    # 计算权重
    weights = calculate_weights(dict(top_50))
    
    # 生成连接
    links = generate_connections(all_words, [w for w, _ in top_50])
    
    # 构建节点数据
    nodes = []
    categories = {
        '核心概念': ['塔', '黑洞', 'Rouyi', '卡冈图雅', '三座塔', '关键词', '知识图谱'],
        '人物': ['Rouyi', '卡冈图雅', 'gargantua', 'aw', 'aw_from_ngc4038'],
        '地点': ['酒馆', '光年酒馆', '塔楼'],
        '活动': ['智识早餐', '复盘', '小酒馆时光', '涂鸦', '留言'],
        '抽象概念': ['存在', '时间', '记忆', '连接', '共振', '等待', '无限游戏']
    }
    
    for word, count in top_50:
        # 确定分类
        category = '其他'
        for cat, words in categories.items():
            if word in words:
                category = cat
                break
        
        nodes.append({
            'id': word,
            'name': word,
            'value': count,
            'symbolSize': weights[word],
            'category': category
        })
    
    # 生成图谱数据
    graph_data = {
        'nodes': nodes,
        'links': links,
        'categories': [{'name': cat} for cat in categories.keys()] + [{'name': '其他'}],
        'generated_at': '2026-03-08',
        'total_words': len(all_words),
        'unique_words': len(word_counts)
    }
    
    # 保存JSON
    output_file = output_dir / 'keywords.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(graph_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 关键词图谱数据已生成: {output_file}")
    print(f"   - 总词数: {len(all_words)}")
    print(f"   - 唯一词: {len(word_counts)}")
    print(f"   - 节点数: {len(nodes)}")
    print(f"   - 连接数: {len(links)}")
    
    # 输出Top 20关键词
    print("\n📊 Top 20 关键词:")
    for word, count in top_50[:20]:
        print(f"   {word}: {count}")

if __name__ == '__main__':
    main()
