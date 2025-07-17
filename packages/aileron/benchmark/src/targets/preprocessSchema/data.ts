export const schema = {
  type: 'object',
  properties: {
    userType: { type: 'string', enum: ['admin', 'user'] },
    permission: { type: 'string', enum: ['read', 'write'] },
    name: { type: 'string' },
    email: { type: 'string' },
    adminField1: { type: 'string' },
    adminField2: { type: 'string' },
    userField1: { type: 'string' },
    userField2: { type: 'string' },
  },
  virtual: {
    basicInfo: { fields: ['name', 'email'] },
    adminInfo: { fields: ['adminField1', 'adminField2'] },
    userInfo: { fields: ['userField1', 'userField2'] },
  },
  if: {
    properties: { userType: { const: 'admin' } },
  },
  then: {
    if: {
      properties: { permission: { const: 'write' } },
    },
    then: {
      required: ['basicInfo', 'adminInfo'],
    },
    else: {
      required: ['basicInfo'],
    },
  },
  else: {
    if: {
      properties: { permission: { const: 'write' } },
    },
    then: {
      required: ['basicInfo', 'userInfo'],
    },
    else: {
      required: ['basicInfo'],
    },
  },
};
