import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { HazardStatus } from '@/types';
import { hazardList } from '@/data/hazard';
import HazardCard from '@/components/HazardCard';
import classnames from 'classnames';
import styles from './index.module.scss';

const statusFilters: { key: HazardStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '整改中' },
  { key: 'rectified', label: '已整改' },
  { key: 'closed', label: '已关闭' }
];

const HazardPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<HazardStatus | 'all'>('all');

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return hazardList;
    return hazardList.filter(h => h.status === activeFilter);
  }, [activeFilter]);

  return (
    <View className={styles.container}>
      <View className={styles.filterBar}>
        {statusFilters.map(f => (
          <View
            key={f.key}
            className={classnames(styles.filterBtn, activeFilter === f.key && styles.filterBtnActive)}
            onClick={() => setActiveFilter(f.key)}
          >
            <Text className={classnames(styles.filterText, activeFilter === f.key && styles.filterTextActive)}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.list}>
        {filteredList.length > 0 ? (
          filteredList.map(item => <HazardCard key={item.id} data={item} />)
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无相关隐患</Text>
          </View>
        )}
      </View>

      <View className={styles.fab} onClick={() => Taro.navigateTo({ url: '/pages/hazard/report/index' })}>
        <Text className={styles.fabText}>+</Text>
      </View>
    </View>
  );
};

export default HazardPage;
