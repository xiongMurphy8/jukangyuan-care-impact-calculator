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
      (0,x.jsx)(`img`,{src:`./assets/workplace.webp`,width:1448,height:1086,alt:`AI生成的包容性办公场景：使用轮椅的员工与同事共同查看文件。非聚康源实拍。`,fetchPriority:`high`}),
      (0,x.jsx)(`figcaption`,{children:`包容性就业场景示意，AI生成，非企业实拍。`})
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
patched = raw[:start] + hero + raw[end:]
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
