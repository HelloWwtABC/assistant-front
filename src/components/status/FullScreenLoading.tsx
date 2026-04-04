import { Spin } from 'antd';

interface FullScreenLoadingProps {
  tip?: string;
}

export function FullScreenLoading({
  tip = '正在初始化应用',
}: FullScreenLoadingProps) {
  return (
    <div className="fullscreen-loading">
      <Spin size="large" tip={tip} />
    </div>
  );
}
