start = raw.index('(0,x.jsx)(`header`,{id:`top`')
end = raw.index('(0,x.jsx)(`section`,{id:`calculator`', start)
old_hero = raw[start:end]
hero = '''(0,x.jsxs)(`header`,{id:`top`,className:`hero screen-only`,children:[
  (0,x.jsxs)(`div`,{className:`shell hero-grid`,children:[
    (0,x.jsxs)(`div`,{className:`hero-copy`,children:[
      (0,x.jsxs)(`h1`,{children:[`1分钟测算企业年度`,(0,x.jsx)(`span`,{children:`政策价值与净收益参考`})]}),
      (0,x.jsx)(`p`,{className:`intro`,children:`输入两项企业数据，初步了解政策价值、用工成本与净收益。`}),
      (0,x.jsxs)(`div`,{className:`hero-actions`,children:[
        (0,x.jsx)(`button`,{onClick:()=>document.querySelector(`#calculator`)?.scrollIntoView({behavior:`instant`}),children:`开始测算`}),
        (0,x.jsx)(`a`,{className:`hero-secondary`,href:`#policies`,children:`查看适用条件和政策依据`})
      ]})
    ]}),
    (0,x.jsxs)(`figure`,{className:`workplace-visual`,children:[
      (0,x.jsx)(`img`,{src:`./@@ASSETS@@/work-team.webp`,width:1600,height:1200,alt:`工作现场，多位工作人员围绕长桌协作整理材料。`,fetchPriority:`high`}),
      (0,x.jsx)(`figcaption`,{children:`日常工作 · 协作作业`})
    ]})
  ]})
]}),
(0,x.jsxs)(`div`,{className:`service-assurance shell screen-only`,children:[
  (0,x.jsxs)(`div`,{className:`assurance-points`,children:[
    (0,x.jsx)(`span`,{children:`无需上传税表原件`}),
    (0,x.jsx)(`span`,{children:`先测算，再决定是否咨询`}),
    (0,x.jsx)(`span`,{children:`以官方审核为准`})
  ]}),
  (0,x.jsx)(`p`,{className:`hero-note`,children:`聚康源为服务机构，非政府或政策发布单位；测算结果仅供前期参考，不构成政策承诺或最终金额确认。`})
]}),'''
# Keep the original policy section and its four official links after the results.
gallery = '''(0,x.jsx)(`section`,{className:`work-gallery shell screen-only`,children:(0,x.jsxs)(`div`,{children:[
(0,x.jsxs)(`div`,{className:`work-gallery-heading`,children:[(0,x.jsx)(`h2`,{children:`日常工作现场`}),(0,x.jsx)(`p`,{children:`从协作作业到现场指导，记录真实的工作日常。`})]}),
(0,x.jsxs)(`div`,{className:`work-gallery-grid`,children:[
(0,x.jsxs)(`figure`,{children:[(0,x.jsx)(`img`,{src:`./@@ASSETS@@/work-sewing.webp`,width:1080,height:810,loading:`lazy`,decoding:`async`,alt:`工作人员在缝纫机旁协作整理布料。`}),(0,x.jsx)(`figcaption`,{children:`缝制作业`})]}),
(0,x.jsxs)(`figure`,{children:[(0,x.jsx)(`img`,{src:`./@@ASSETS@@/work-guidance.webp`,width:1080,height:810,loading:`lazy`,decoding:`async`,alt:`两位工作人员在桌前共同完成手工作业。`}),(0,x.jsx)(`figcaption`,{children:`现场指导`})]}),
(0,x.jsxs)(`figure`,{children:[(0,x.jsx)(`img`,{src:`./@@ASSETS@@/work-production.webp`,width:1080,height:810,loading:`lazy`,decoding:`async`,alt:`工作人员在堆放生产材料的车间内交流。`}),(0,x.jsx)(`figcaption`,{children:`生产现场`})]})
]})]})}),'''
patched = raw[:start] + hero + gallery + raw[end:]
# Only exact presentation strings change. Identifiers, fields and financial code stay intact.
replacements = {
    'children:`开始测算 →`': 'children:`开始测算`',
    '`生成 PDF 报告 →`': '`生成 PDF 报告`',
    '`获取人工复核建议`': '`人工复核`',
    '`测算后再咨询`': '`人工复核`',
    '`生成PDF`': '`生成 PDF 报告`',
    '`先去测算`': '`开始测算`',
    'children:`提交并获取复核建议`': 'children:`提交并获取复核建议`',
    '`—`': '`待填写`',
    'behavior:`smooth`': 'behavior:`instant`',
}
for before, after in replacements.items():
    patched = patched.replace(before, after)
