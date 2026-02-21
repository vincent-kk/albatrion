import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import type { ReactNode } from 'react';

interface LangTabsProps {
  en: ReactNode;
  kr: ReactNode;
}

export default function LangTabs({ en, kr }: LangTabsProps) {
  return (
    <Tabs groupId="lang" defaultValue="en">
      <TabItem value="en" label="English">
        {en}
      </TabItem>
      <TabItem value="kr" label="한국어">
        {kr}
      </TabItem>
    </Tabs>
  );
}
