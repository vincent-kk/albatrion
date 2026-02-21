import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      placeholder: 'e.g. Jane Smith',
      default: 'Jane Smith',
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email',
      placeholder: 'e.g. jane@example.com',
    },
    participantType: {
      type: 'string',
      title: 'Participant Type',
      enum: ['speaker', 'attendee', 'sponsor'],
      default: 'attendee',
      description: 'Different fields appear based on participant type',
    },
    topic: {
      type: 'string',
      title: 'Talk Topic',
      placeholder: 'e.g. Building Scalable Forms',
      computed: { visible: "../participantType === 'speaker'" },
    },
    bio: {
      type: 'string',
      title: 'Speaker Bio',
      format: 'textarea',
      placeholder: 'Brief introduction about the speaker...',
      computed: { visible: "../participantType === 'speaker'" },
    },
    companyName: {
      type: 'string',
      title: 'Company Name',
      placeholder: 'e.g. Acme Corp',
      computed: { visible: "../participantType === 'sponsor'" },
    },
    sponsorTier: {
      type: 'string',
      title: 'Sponsor Tier',
      formType: 'radio',
      enum: ['gold', 'silver', 'bronze'],
      default: 'silver',
      computed: { visible: "../participantType === 'sponsor'" },
    },
    ticketCount: {
      type: 'integer',
      title: 'Number of Tickets',
      minimum: 1,
      maximum: 10,
      default: 1,
      description: 'How many tickets to purchase (1-10)',
    },
    ticketPrice: {
      type: 'number',
      title: 'Price per Ticket ($)',
      default: 100,
    },
    totalAmount: {
      type: 'number',
      title: 'Total Amount ($)',
      description: 'Auto-calculated: Tickets × Price',
      computed: {
        derived: '../ticketCount * ../ticketPrice',
      },
    },
    eventDate: { type: 'string', title: 'Event Date', format: 'date' },
    sessions: {
      type: 'array',
      title: 'Sessions',
      formType: 'checkbox',
      items: {
        type: 'string',
        enum: ['morning', 'afternoon', 'evening'],
      },
      default: ['morning'],
    },
    dietary: {
      type: 'string',
      title: 'Dietary Requirements',
      enum: ['regular', 'vegetarian', 'vegan', 'halal', 'kosher'],
      default: 'regular',
    },
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
      formType: 'switch',
      default: true,
    },
    website: {
      type: 'string',
      title: 'Company Website',
      format: 'uri',
      placeholder: 'https://example.com',
      computed: { visible: "../participantType === 'sponsor'" },
    },
  },
  required: ['name', 'email', 'participantType'],
};

export default function HeroDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
