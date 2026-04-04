import { Tag } from 'antd';

import { useDocumentTitle } from '@/hooks/useDocumentTitle';

import { PageStatus } from '../status/PageStatus';
import { PageContainer } from './PageContainer';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  emptyDescription?: string;
}

export function ModulePlaceholder({
  title,
  description,
  emptyDescription,
}: ModulePlaceholderProps) {
  useDocumentTitle(title);

  return (
    <PageContainer
      title={title}
      description={description}
      extra={<Tag color="blue">Mock Ready</Tag>}
    >
      <PageStatus
        empty
        emptyDescription={
          emptyDescription ??
          '当前模块已完成路由与页面骨架预留，后续可直接接入 mock 列表、筛选、表格和真实后端接口。'
        }
      >
        <div />
      </PageStatus>
    </PageContainer>
  );
}
