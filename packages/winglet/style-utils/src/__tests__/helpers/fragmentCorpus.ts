/** Fixed lexical and rule-position inputs cover the fragment contracts across all five rounds. */
export const fragmentCorpus = [
  '.a{color:red}', '.a { color: red; };', '.a{color:red}}', ';', '}', ';;}}',
  '@layer theme{@layer light,dark;} .card{color:red}',
  '@layer theme{@layer light,dark} .card{color:red}',
  '@layer theme{@layer light,dark', '@media (x){@layer x;',
  '@media (x){.a{color:red}', '@media (x)', '@import "x.css"', '@namespace svg url(x)', '@charset "utf-8";',
  '.a{color:red', '.a:is(.open', '.a{--x:(one[two', '.a{--x:{one:two',
  '.a{content:"unfinished', '.a{content:"abc\\', '.a{content:"abc\\\\',
  '.a{background:url(x', '.a{background:url(x\\', '.a{background:url(x\\\\',
  '.a{color:red\\', '.a{color:red\\\\', '.a{color:red}/*', '/*', '.a{content:"x\n.b{color:red}',
  '<!-- .a{color:red} -->', '<!--', '-->', '.a <!--', '\uFEFF.b{color:blue}',
  '.a{content:"/* literal */"}', '.a{background:url(http://x/a/*b)}',
  '.a\\31  .b{color:red}', '.md\\:flex{color:red}', '[title="a,b"]{color:red}',
  '@supports selector(:is(.a,.b)){.a{color:red}}', '@keyframes k{from{opacity:0}to{opacity:1}}',
  '@font-face{font-family:"F";src:url(f.woff2)}', ':root{--x:1}', ':host{color:red}',
  '.a{--x:1px + 2px}', '.a{--x:1px - 2px}', '', '  \n\t',
];
