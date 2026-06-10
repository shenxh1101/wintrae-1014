import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { InspectionRoute } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

interface InspectionCardProps {
  data: InspectionRoute;
}

const statusMap: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const InspectionCard: React.FC<InspectionCardProps> = ({ data }) => {
  const handleClick = () => {
    if (data.status === 'completed') return;
    Taro.navigateTo({ url: `/pages/inspect/check/index?id=${data.id}` });
  };

  const progress = data.totalPoints > 0
    ? Math.round((data.checkedPoints / data.totalPoints) * 100)
    : 0;

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.name}>{data.name}</Text>
        <View
          className={classnames(
            styles.statusTag,
            data.status === 'pending' && styles.statusPending,
            data.status === 'in_progress' && styles.statusProgress,
            data.status === 'completed' && styles.statusCompleted
          )}
        >
          <Text className={styles.statusText}>{statusMap[data.status]}</Text>
        </View>
      </View>
      <View className={styles.progressRow}>
        <View className={styles.progressBg}>
          <View
            className={classnames(
              styles.progressFill,
              data.status === 'completed' && styles.progressFillDone
            )}
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className={styles.progressText}>{data.checkedPoints}/{data.totalPoints}</Text>
      </View>
      <View className={styles.footer}>
        <Text className={styles.floor}>{data.floor}</Text>
        {data.status !== 'pending' && data.startTime && (
          <Text className={styles.time}>{data.startTime}</Text>
        )}
      </View>
    </View>
  );
};

export default InspectionCard;
