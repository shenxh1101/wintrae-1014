import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { UserRole } from '@/types';
import { hazardList } from '@/data/hazard';
import { statistics } from '@/data/statistics';
import HazardCard from '@/components/HazardCard';
import classnames from 'classnames';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('tenant');

  const recentHazards = hazardList.filter(h => h.status !== 'closed').slice(0, 3);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>消防管理中心</Text>
        <View className={styles.roleSwitch}>
          <View
            className={classnames(styles.roleBtn, role === 'tenant' ? styles.roleBtnActive : styles.roleBtnInactive)}
            onClick={() => setRole('tenant')}
          >
            <Text className={classnames(styles.roleText, role === 'tenant' ? styles.roleTextActive : styles.roleTextInactive)}>
              租户
            </Text>
          </View>
          <View
            className={classnames(styles.roleBtn, role === 'inspector' ? styles.roleBtnActive : styles.roleBtnInactive)}
            onClick={() => setRole('inspector')}
          >
            <Text className={classnames(styles.roleText, role === 'inspector' ? styles.roleTextActive : styles.roleTextInactive)}>
              巡检员
            </Text>
          </View>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{statistics.pendingHazards}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{statistics.processingHazards}</Text>
            <Text className={styles.statLabel}>整改中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, statistics.overdueCount > 0 && styles.statValueUrgent)}>
              {statistics.overdueCount}
            </Text>
            <Text className={styles.statLabel}>已逾期</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, statistics.highRiskCount > 0 && styles.statValueUrgent)}>
              {statistics.highRiskCount}
            </Text>
            <Text className={styles.statLabel}>高风险</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.quickActions}>
          <View
            className={styles.actionItem}
            onClick={() => Taro.navigateTo({ url: '/pages/hazard/report/index' })}
          >
            <View className={classnames(styles.actionIcon, styles.actionIconReport)}>
              <Text>🚨</Text>
            </View>
            <Text className={styles.actionName}>隐患上报</Text>
          </View>
          <View
            className={styles.actionItem}
            onClick={() => Taro.switchTab({ url: '/pages/inspect/index' })}
          >
            <View className={classnames(styles.actionIcon, styles.actionIconInspect)}>
              <Text>🔍</Text>
            </View>
            <Text className={styles.actionName}>巡检打卡</Text>
          </View>
          <View
            className={styles.actionItem}
            onClick={() => Taro.navigateTo({ url: '/pages/equipment/index' })}
          >
            <View className={classnames(styles.actionIcon, styles.actionIconEquip)}>
              <Text>🧯</Text>
            </View>
            <Text className={styles.actionName}>器材查询</Text>
          </View>
          <View
            className={styles.actionItem}
            onClick={() => Taro.navigateTo({ url: '/pages/training/index' })}
          >
            <View className={classnames(styles.actionIcon, styles.actionIconTrain)}>
              <Text>📋</Text>
            </View>
            <Text className={styles.actionName}>培训签到</Text>
          </View>
        </View>
      </View>

      {statistics.overdueCount > 0 && (
        <View className={styles.section}>
          <View className={styles.alertCard}>
            <Text className={styles.alertIcon}>⚠️</Text>
            <View className={styles.alertContent}>
              <Text className={styles.alertTitle}>{statistics.overdueCount}项隐患已逾期</Text>
              <Text className={styles.alertDesc}>请尽快处理，避免安全风险</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>近期隐患</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/hazard/index' })}>
            查看全部 &gt;
          </Text>
        </View>
        <View className={styles.hazardList}>
          {recentHazards.map(item => (
            <HazardCard key={item.id} data={item} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default HomePage;
