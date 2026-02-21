import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    participantType: {
      type: 'string',
      title: 'Participant Type',
      enum: ['adult', 'minor'],
      default: 'adult',
      description:
        'Required fields change based on participant type and region',
    },
    participantRegion: {
      type: 'string',
      title: 'Region',
      enum: ['domestic', 'international'],
      default: 'domestic',
    },
    name: {
      type: 'string',
      title: 'Name',
      placeholder: 'e.g. Jane Smith',
    },
    passportNumber: {
      type: 'string',
      title: 'Passport Number',
      pattern: '^[A-Z0-9]{9}$',
      placeholder: 'e.g. AB1234567',
      description: 'Format: 9 uppercase letters/digits (e.g. AB1234567)',
    },
    visaInformation: {
      type: 'string',
      title: 'Visa Information',
      placeholder: 'e.g. B-1 Business Visa',
      description: 'Required for international adult participants',
    },
    nationalIdNumber: {
      type: 'string',
      title: 'National ID Number',
      pattern: '^[0-9]{6}-[0-9]{7}$',
      placeholder: 'e.g. 900101-1234567',
      description: 'Format: 6 digits - 7 digits (e.g. 900101-1234567)',
    },
    guardianConsent: {
      type: 'string',
      title: 'Guardian Consent',
      placeholder: 'Guardian full name',
      description: 'Required for minor participants',
    },
    guardianContact: {
      type: 'string',
      title: 'Guardian Contact',
      pattern: '^[0-9]{3}-[0-9]{4}-[0-9]{4}$',
      placeholder: 'e.g. 010-1234-5678',
      description: 'Format: 000-0000-0000',
    },
  },
  if: {
    properties: {
      participantType: { const: 'adult' },
      participantRegion: { const: 'international' },
    },
  },
  then: {
    required: ['name', 'passportNumber', 'visaInformation'],
  },
  else: {
    if: {
      properties: {
        participantType: { const: 'adult' },
        participantRegion: { const: 'domestic' },
      },
    },
    then: {
      required: ['name', 'nationalIdNumber'],
    },
    else: {
      if: {
        properties: {
          participantType: { const: 'minor' },
        },
      },
      then: {
        required: ['name', 'guardianConsent', 'guardianContact'],
      },
      else: {
        required: ['name'],
      },
    },
  },
  required: ['participantType', 'participantRegion'],
};

export default function ConditionalRegistrationDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
