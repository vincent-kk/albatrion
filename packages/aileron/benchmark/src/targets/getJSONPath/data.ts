export const value = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    profile: {
      type: 'adult',
      age: 30,
      gender: 'male',
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          sms: false,
        },
      },
    },
  },
  settings: {
    privacy: 'custom',
    language: 'en',
    security: {
      '2FA': true,
      backupCodes: ['ABCD1234', 'EFGH5678', 'IJKL9012', 'MNOP3456', 'QRST7890'],
    },
  },
};
