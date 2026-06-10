import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatusTagProps {
  status: string;
  statusMap: Record<string, string>;
  type?: 'hazard' | 'risk' | 'inspection' | 'equipment';
}

const statusColorMap: Record<string, { bg: string; color: string }> = {
  pending: { bg: '$color-tag-bg-pending', color: '$color-pending' },
  processing: { bg: '$color-tag-bg-warn', color: '$color-warning' },
  rectified: { bg: '$color-tag-bg-success', color: '$color-success' },
  closed: { bg: '#f2f3f5', color: '#86909c' },
  high: { bg: '$color-tag-bg-risk', color: '$color-risk-high' },
  medium: { bg: '$color-tag-bg-warn', color: '$color-risk-medium' },
  low: { bg: '$color-tag-bg-success', color: '$color-risk-low' },
  normal: { bg: '$color-tag-bg-success', color: '$color-success' },
  abnormal: { bg: '$color-tag-bg-risk', color: '$color-risk-high' },
  in_progress: { bg: '$color-tag-bg-pending', color: '$color-pending' },
  completed: { bg: '$color-tag-bg-success', color: '$color-success' }
};

const StatusTag: React.FC<StatusTagProps> = ({ status, statusMap }) => {
  const label = statusMap[status] || status;
  const colorConfig = statusColorMap[status];
  const colorClass = colorConfig
    ? styles[`status${status.charAt(0).toUpperCase()}${status.slice(1)}`]
    : '';

  return (
    <View className={`${styles.tag} ${colorClass}`}>
      <Text className={styles.tagText}>{label}</Text>
    </View>
  );
};

export default StatusTag;
