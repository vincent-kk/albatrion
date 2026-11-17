export const patches = [

  { op: 'test', path: '/user/name', value: 'Vincent' },


  { op: 'replace', path: '/user/email', value: 'vincent@newdomain.com' },


  { op: 'add', path: '/user/status', value: 'active' },


  { op: 'add', path: '/user/roles/1', value: 'editor' },


  { op: 'remove', path: '/user/roles/0' },


  { op: 'move', from: '/user/settings/theme', path: '/user/theme' },


  { op: 'copy', from: '/user/theme', path: '/user/settings/appearance' },


  { op: 'remove', path: '/user/settings/notifications' },


  { op: 'replace', path: '/projects/1/title', value: 'Gamma' },


  {
    op: 'add',
    path: '/projects/-',
    value: { id: 'p3', title: 'Delta' },
  },
];
