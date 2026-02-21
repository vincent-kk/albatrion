import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    userType: {
      type: 'string',
      enum: ['guest', 'member', 'admin'],
      default: 'guest',
      title: 'User Type',
      description: 'Fields visibility and activation change based on user role',
    },
    name: {
      type: 'string',
      title: 'Name',
      placeholder: 'e.g. Jane Smith',
      description: 'Always required for all user types',
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email',
      placeholder: 'e.g. jane@example.com',
      description: 'Visible for members and admins only',
      '&visible': '../userType !== "guest"',
    },
    phoneNumber: {
      type: 'string',
      title: 'Phone',
      placeholder: 'e.g. 010-1234-5678',
      description: 'Active for members and admins only',
      '&active': '../userType !== "guest"',
    },
    membershipLevel: {
      type: 'string',
      enum: ['basic', 'premium', 'vip'],
      title: 'Membership Level',
      description: 'Visible for members only',
      '&visible': '../userType === "member"',
      default: 'basic',
    },
    membershipExpiry: {
      type: 'string',
      format: 'date',
      title: 'Membership Expiry',
      description: 'Active for members only',
      '&active': '../userType === "member"',
    },
    adminPermissions: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['read', 'write', 'delete', 'manage'],
      },
      title: 'Admin Permissions',
      description: 'Visible for admins only — select granted permissions',
      '&visible': '../userType === "admin"',
      default: ['read', 'write'],
    },
    adminCode: {
      type: 'string',
      title: 'Admin Code',
      placeholder: 'e.g. ADM-2024-001',
      description: 'Active for admins only',
      '&active': '../userType === "admin"',
    },
  },
};

export default function RoleBasedAccessDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
