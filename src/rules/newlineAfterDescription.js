import _ from 'lodash';
import iterateJsdoc from '../iterateJsdoc';

export default iterateJsdoc(({
  jsdoc,
  report,
  context,
  jsdocNode,
  sourceCode,
  indent,
}) => {
  let always;

  if (!jsdoc.description || !jsdoc.tags.length) {
    return;
  }

  if (_.has(context.options, 0)) {
    always = context.options[0] === 'always';
  } else {
    always = true;
  }

  // The contents of the jsdoc.source and of jsdoc.description is left trimmed.
  // The contents of the jsdoc.description is right trimmed.
  // This gets the text following the description.
  const descriptionEndsWithANewline = jsdoc.source.slice(jsdoc.description.length).startsWith('\n\n');

  if (always) {
    if (!descriptionEndsWithANewline) {
      const sourceLines = sourceCode.getText(jsdocNode).split('\n');
      const lastDescriptionLine = _.findLastIndex(sourceLines, (line) => {
        return line.replace(/^\s*\*\s*/u, '') === _.last(jsdoc.description.split('\n'));
      });
      report('There must be a newline after the description of the JSDoc block.', (fixer) => {
        // Add the new line
        sourceLines.splice(lastDescriptionLine + 1, 0, `${indent} *`);

        return fixer.replaceText(jsdocNode, sourceLines.join('\n'));
      }, {
        line: lastDescriptionLine,
      });
    }
  } else if (descriptionEndsWithANewline) {
    const sourceLines = sourceCode.getText(jsdocNode).split('\n');
    const lastDescriptionLine = _.findLastIndex(sourceLines, (line) => {
      return line.replace(/^\s*\*\s*/u, '') === _.last(jsdoc.description.split('\n'));
    });
    report('There must be no newline after the description of the JSDoc block.', (fixer) => {
      // Remove the extra line
      sourceLines.splice(lastDescriptionLine + 1, 1);

      return fixer.replaceText(jsdocNode, sourceLines.join('\n'));
    }, {
      line: lastDescriptionLine + 1,
    });
  }
}, {
  iterateAllJsdocs: true,
  meta: {
    fixable: 'whitespace',
    schema: [
      {
        enum: ['always', 'never'],
        type: 'string',
      },
    ],
    type: 'layout',
  },
});
