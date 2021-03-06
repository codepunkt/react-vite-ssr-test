const { createFilter } = require('rollup-pluginutils')
const path = require('path')
const Remark = require('remark')
const grayMatter = require('gray-matter')
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)

const markdownPlugin = (options = {}) => {
  const {
    remarkOptions = {},
    include,
    exclude,
  } = options

  const filter = createFilter(include, exclude)

  return {
    name: 'rollup-plugin-markdown',
    enforce: 'pre',
    transform(code, id) {
      if (!filter(id) === -1) return
      const extension = path.extname(id)
      if (extension !== '.md') return

      const parsed = grayMatter(code, {})
      const frontmatter = { title: '', ...parsed.data }
      const markdown = parsed.content

      // apply plugins that change Markdown or Frontmatter
      let remark = new Remark().data(`settings`, remarkOptions)
      const markdownAST = remark.parse(markdown)

      // apply plugins that change MDAST
      const htmlAST = toHAST(markdownAST, { allowDangerousHtml: true })
      // apply plugins that change HAST
      const html = hastToHTML(htmlAST, { allowDangerousHtml: true })
      
      const wat = require('@babel/core').transformSync(`export default function Post() { return <>${html}</> }`, { ast: false, presets: ['@babel/preset-react'] }).code
      console.log(`import React from "react";\nexport default function Post() { return ${wat} }`)
      
      return {
        code: `import React from "react";\n${wat}`,
      }
    },
  }
}

module.exports = markdownPlugin