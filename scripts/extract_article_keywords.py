#!/usr/bin/env python3
"""
从 articles/ 目录的 HTML 文章中提取关键词，合并进 data/keywords.json。
保留现有节点和链接（基于 memory），把文章中高频的概念词加进来，
重新分类并归一化节点大小。

⚠️ 注意：此脚本非幂等——重复运行会把文章词频叠加到上次的结果上。
重新合并前请先回滚到上次干净的 keywords.json：
    git checkout HEAD -- data/keywords.json

Usage:
    python3 scripts/extract_article_keywords.py
"""

import re
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = ROOT / 'articles'
KEYWORDS_FILE = ROOT / 'data' / 'keywords.json'

# ---------- 过滤规则 ----------
STOP_WORDS = {
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都',
    '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会',
    '着', '没有', '看', '好', '自己', '这', '那', '个', '为', '能', '而',
    '让', '可以', '吧', '呢', '啊', '吗', '得', '地', '过', '些', '还',
    '把', '被', '从', '给', '向', '往', '于', '即', '及', '其', '或', '乃',
    '并且', '以及', '但是', '然而', '因为', '所以', '因此', '如果',
    '即使', '虽然', '尽管', '那么', '然后', '而且', '此外', '另外',
    '加之', '从而', '进而', '反而', '否则', '不然', '要不', '要不然',
    '什么', '怎么', '为什么', '一些', '一直', '一定', '一次', '一种', '一样',
    '可能', '应该', '需要', '已经', '正在', '将要', '不过', '只是', '只有',
    '比如', '例如', '其实', '其中', '本身', '本来', '原来', '一直',
    '比较', '更加', '非常', '特别', '尤其', '相对', '完全', '简单',
    '今天', '昨天', '明天', '现在', '此时', '此刻', '过去', '未来',
    '里面', '外面', '上面', '下面', '前面', '后面', '中间', '旁边',
    # 通用动作类
    '思考', '观察', '感受', '体验', '认识', '理解', '看到', '听到', '感到',
    '认为', '觉得', '希望', '想要', '喜欢', '不会', '不能', '不要',
    '出来', '出去', '回来', '过来', '起来', '下来', '进去', '上去',
    # 文体/句式相关
    '一种', '一个', '一篇', '一段', '一种', '一类', '一套', '一系列',
    '所有', '每个', '某个', '部分', '全部', '所谓', '其他', '另一',
    # 低信息高频词（文章常见但非核心概念）
    '调用', '我想', '同时', '祝好', '同样', '相同', '类似', '不同',
    '处理', '关注', '产生', '出现', '存在', '具有', '形成', '导致',
    '包括', '包含', '提到', '提供', '提出', '主要', '基本', '重要',
    '其实', '其次', '不仅', '甚至', '哪怕', '即便',
    '关于', '对于', '至于', '由于', '为了',
    # 弱内容词
    '事情', '事物', '东西', '内容', '形式', '方式', '方法', '过程',
    '结果', '原因', '问题', '情况', '影响', '作用', '意义', '价值',
    '世界', '社会', '生活', '世间', '世俗', '人类', '人们', '我们',
    # 英文低信息词
    'the', 'and', 'for', 'with', 'from', 'this', 'that', 'these', 'those',
    'are', 'was', 'were', 'have', 'has', 'had', 'will', 'can', 'would',
    'should', 'could', 'may', 'might', 'all', 'any', 'some', 'each',
    'not', 'but', 'too', 'very', 'just', 'only', 'also', 'than',
}

# 文章核心概念词（强制保留 + 提权）
ARTICLE_CONCEPTS = [
    # 神经科学
    '参考系', '皮质柱', '神经元', '多巴胺', '催产素', '血清素', '内啡肽',
    '激素', '默认模式网络', '不应期', '欲望回路',
    # 灵性/佛学
    '本我', '小我', '临在', '内观', '觉察', '我执', '冥想', '佛家',
    '无我', '空性', '当下',
    # 物理/宇宙
    '熵增', '涌现', '量子纠缠', '星辰粒子', '概率云', '坍缩', '宇宙',
    '高维', '负熵', '回归定理', '永恒轮回',
    # 核心比喻
    '塔楼', '砖石', '间隙', '缝隙', '载波间隙', '壳', '心', '镜子',
    '共脑', '场域', '幻觉', '场', '镜面',
    # 母题
    '能量', '共振', '降频', '内观', '顺其自然', '生命河流', '看见',
    '被看见', '投射', '空心化', '主体性',
    # 关系
    '关系', '预期', '反馈回路', '认知失调', '锚定效应', '共识',
    '决策', '状态流', '逻辑流', '人性流', '同频',
    # 人物/出处
    'Rouyi', '卡冈图雅', '荣格', '王阳明', '张津剑', '孟岩', '尼采',
    '庞加莱', '程心', 'Julian Huxley',
    # 概念词组
    '记忆', '解构', '建构', '创新', '创造力', '心流', '同理心',
    '空中楼阁', '生命力', '可爱', '抽离', '修行', '客体化',
    '自性化', '集体无意识', '异化',
    # 英文专名（白名单）
    'MBTI', 'AI', 'LLM', 'Matrix', 'DMN', 'CDR',
    # 文章主题词
    '爱', '空', '人', '塔', '感受', '工作', '归因',
    '未见之地', '幻觉', '降频',
]

# 分类规则（命中即归类，按顺序优先）
CATEGORY_RULES = [
    ('核心概念', ['塔', '黑洞', '塔楼', '砖石', '间隙', '缝隙', '载波间隙',
                  '参考系', '能量', '共振', '场域', '共脑', '未见之地', '场',
                  '平行宇宙', '甜甜圈']),
    ('神经科学', ['皮质柱', '神经元', '多巴胺', '催产素', '血清素', '内啡肽',
                  '激素', '欲望回路', '默认模式网络', '不应期', '大脑', 'DMN']),
    ('灵性/佛学', ['本我', '小我', '临在', '内观', '觉察', '我执', '冥想',
                    '佛家', '无我', '空性', '当下', '修行', '王阳明']),
    ('物理/宇宙', ['熵增', '涌现', '量子纠缠', '星辰粒子', '概率云', '坍缩',
                    '宇宙', '高维', '负熵', '回归定理', '永恒轮回', 'Matrix']),
    ('社会/关系', ['壳', '心', '空心化', '关系', '爱', '看见', '被看见',
                    '镜子', '投射', '主体性', '同频', '异化', '客体化']),
    ('决策/认知', ['决策', '状态流', '逻辑流', '人性流', '共识', 'CDR',
                    '反馈回路', '认知失调', '锚定效应', '预期', 'MBTI']),
    ('人物', ['Rouyi', '卡冈图雅', 'gargantua', 'aw', 'aw_from_ngc4038',
              '小王子', '荣格', '王阳明', '张津剑', '孟岩', '尼采',
              '庞加莱', '程心', 'Julian Huxley']),
    ('地点', ['酒馆', '光年酒馆', 'NGC4038', '大理', '洱海', '景德镇',
              '嵊泗', '马来西亚', '大阪']),
    ('活动', ['智识早餐', '每日复盘', '小酒馆时光', '涂鸦', '留言',
              '冥想', '创作', '旅行', '阅读']),
    ('抽象概念', ['存在', '时间', '记忆', '连接', '等待', '无限游戏',
                    '归因', '失重', '幻觉', '降频', '空', '生命河流',
                    '生命力', '痛苦', '建构', '解构', '有限与无限的游戏']),
    ('工作/创作', ['工作', '创新', '创作', '创造力', '解构', '建构',
                    '预设共识', '分析', '产品', '数据']),
]


def strip_html(html: str) -> str:
    """只从 <div class="article-content"> 块内取纯文本，避开导航/作者/页脚。"""
    # 只保留 article-content 块的内容
    m = re.search(
        r'<div\s+class="article-content"[^>]*>(.*?)</div>\s*(?=<div\s+class="(?:article-footer|rouyi-article-footer)"|</article>)',
        html, flags=re.S | re.I,
    )
    body = m.group(1) if m else html
    body = re.sub(r'<style[^>]*>.*?</style>', ' ', body, flags=re.S | re.I)
    body = re.sub(r'<script[^>]*>.*?</script>', ' ', body, flags=re.S | re.I)
    body = re.sub(r'<[^>]+>', ' ', body)
    body = re.sub(r'&nbsp;|&amp;|&lt;|&gt;|&quot;|&#\d+;', ' ', body)
    return body


def extract_words(text: str):
    """从文本中抽词：中文 2-8、英文 ≥2、概念词优先匹配。"""
    chinese = re.findall(r'[一-鿿]{2,8}', text)
    english = re.findall(r'[A-Za-z][A-Za-z0-9]{1,}', text)
    # 概念词强力匹配（短词避开汉字嵌套问题）
    concepts = []
    for c in ARTICLE_CONCEPTS:
        n = text.count(c)
        if n > 0:
            concepts.extend([c] * n)
    return chinese + english + concepts


def filter_words(words, existing_names):
    """过滤停用词，英文用白名单。"""
    out = []
    english_allow = {w.lower() for w in ARTICLE_CONCEPTS if re.match(r'^[A-Za-z]+$', w)}
    english_allow |= {n.lower() for n in existing_names if re.match(r'^[A-Za-z]', n)}
    for w in words:
        if not w or len(w) < 2:
            continue
        if w in STOP_WORDS or w.lower() in STOP_WORDS:
            continue
        if re.match(r'^[A-Za-z][A-Za-z0-9]*$', w):
            if w.lower() not in english_allow:
                continue
        out.append(w)
    return out


def classify(name: str) -> str:
    for cat, words in CATEGORY_RULES:
        if name in words:
            return cat
    return '其他'


def main():
    with open(KEYWORDS_FILE, encoding='utf-8') as f:
        existing = json.load(f)

    existing_nodes = {n['name']: n for n in existing['nodes']}
    existing_links = existing['links']

    # 抽取文章关键词
    all_words = []
    per_article_top = {}
    article_files = sorted(ARTICLES_DIR.glob('*.html'))
    for af in article_files:
        text = strip_html(af.read_text(encoding='utf-8'))
        words = filter_words(extract_words(text), existing_nodes.keys())
        all_words.extend(words)
        per_article_top[af.stem] = Counter(words).most_common(15)
        print(f"  {af.name}: {len(words)} 词")

    article_counts = Counter(all_words)

    # 文章 top 60 + 现有节点（保留 ≥ 3 频次）
    article_top = [w for w, c in article_counts.most_common(60) if c >= 2]

    # 合并节点
    merged = {}
    # 1) 保留已有节点（基础权重）
    for name, node in existing_nodes.items():
        merged[name] = {
            'id': name,
            'name': name,
            'value': node['value'],
            'category': node.get('category', '其他'),
        }
    # 2) 加入文章 top（叠加权重）
    for word in article_top:
        c = article_counts[word]
        if word in merged:
            merged[word]['value'] += c
        else:
            merged[word] = {
                'id': word,
                'name': word,
                'value': c,
                'category': '其他',
            }

    # 重新分类（用新的规则覆盖）
    for node in merged.values():
        node['category'] = classify(node['name'])

    # 取 top 65 节点
    sorted_nodes = sorted(merged.values(), key=lambda n: -n['value'])[:65]
    keep_names = {n['name'] for n in sorted_nodes}

    # 归一化 symbolSize（10-50）
    max_v = max(n['value'] for n in sorted_nodes)
    for n in sorted_nodes:
        n['symbolSize'] = round(10 + (n['value'] / max_v) * 40, 1)

    # 链接：保留已有的（两端都在新节点集中，且非自环），再加入文章窗口共现
    kept_existing = [l for l in existing_links
                     if l['source'] in keep_names
                     and l['target'] in keep_names
                     and l['source'] != l['target']]

    # 文章窗口共现（窗口 25）
    window = 25
    co = Counter()
    for i in range(0, len(all_words) - window):
        win_words = [w for w in all_words[i:i+window] if w in keep_names]
        seen = list(set(win_words))
        for a in range(len(seen)):
            for b in range(a+1, len(seen)):
                pair = tuple(sorted([seen[a], seen[b]]))
                co[pair] += 1

    new_links = []
    seen_pairs = {tuple(sorted([l['source'], l['target']])) for l in kept_existing}
    for (s, t), c in co.most_common(150):
        if c < 3:
            break
        if (s, t) in seen_pairs:
            continue
        new_links.append({'source': s, 'target': t, 'value': min(c, 10)})
        seen_pairs.add((s, t))
        if len(kept_existing) + len(new_links) >= 140:
            break

    all_links = kept_existing + new_links

    # 类别列表
    categories = [{'name': c} for c, _ in CATEGORY_RULES] + [{'name': '其他'}]

    out = {
        'nodes': sorted_nodes,
        'links': all_links,
        'categories': categories,
        'generated_at': '2026-05-26',
        'total_words': existing.get('total_words', 0) + len(all_words),
        'unique_words': len(merged),
    }

    KEYWORDS_FILE.write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8'
    )

    print(f"\n✅ 已更新 {KEYWORDS_FILE.relative_to(ROOT)}")
    print(f"  节点: {len(sorted_nodes)} | 链接: {len(all_links)}")
    print(f"  保留 existing 链接: {len(kept_existing)} | 文章新增链接: {len(new_links)}")
    print(f"\n📊 文章 Top 25 关键词：")
    for w, c in article_counts.most_common(25):
        print(f"  {w:10s} {c}")


if __name__ == '__main__':
    main()
