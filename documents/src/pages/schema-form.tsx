import React from 'react';

import Layout from '@theme/Layout';

import styles from './schema-form.module.css';

export default function SchemaForm(): JSX.Element {
  return (
    <Layout title="Schema Form">
      <main className="container margin-vert--lg">
        <div className={styles.storybookContainer}>
          <iframe
            src="/storybook/schema-form/iframe.html"
            className={styles.storybookFrame}
            title="Schema Form Storybook"
          />
        </div>
      </main>
    </Layout>
  );
}
