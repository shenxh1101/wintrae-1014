import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import { inspectionRoutes } from '@/data/inspection';
import InspectionCard from '@/components/InspectionCard';
import classnames from 'classnames';
import styles from './index.module.scss';

const floorOptions = ['全部', '1F', '2F', '3F', '4F', '5F'];

const InspectPage: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState('全部');

  const filteredRoutes = useMemo(() => {
    if (activeFloor === '全部') return inspectionRoutes;
    return inspectionRoutes.filter(r => r.floor === activeFloor);
  }, [activeFloor]);

  const completedCount = inspectionRoutes.filter(r => r.status === 'completed').length;
  const inProgressCount = inspectionRoutes.filter(r => r.status === 'in_progress').length;

  return (
    <View className={styles.container}>
      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{inspectionRoutes.length}</Text>
          <Text className={styles.summaryLabel}>今日路线</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{completedCount}</Text>
          <Text className={styles.summaryLabel}>已完成</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{inProgressCount}</Text>
          <Text className={styles.summaryLabel}>进行中</Text>
        </View>
      </View>

      <View className={styles.floorTabs}>
        {floorOptions.map(floor => (
          <View
            key={floor}
            className={classnames(styles.floorTab, activeFloor === floor && styles.floorTabActive)}
            onClick={() => setActiveFloor(floor)}
          >
            <Text className={classnames(styles.floorTabText, activeFloor === floor && styles.floorTabTextActive)}>
              {floor}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.routeList}>
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map(route => <InspectionCard key={route.id} data={route} />)
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🔍</Text>
            <Text className={styles.emptyText}>该楼层暂无巡检路线</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default InspectPage;
