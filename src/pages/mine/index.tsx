import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const menuItems = [
    { icon: '📝', label: '我的上报', url: '/pages/hazard/index' },
    { icon: '🔧', label: '整改任务', url: '/pages/rectify/index' },
    { icon: '🧯', label: '器材查询', url: '/pages/equipment/index' },
    { icon: '📋', label: '培训记录', url: '/pages/training/index' },
    { icon: '🔔', label: '消息设置', url: '' },
    { icon: '⚙️', label: '系统设置', url: '' }
  ];

  const handleMenuClick = (url: string) => {
    if (!url) {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    if (url.startsWith('/pages/hazard')) {
      Taro.switchTab({ url: '/pages/hazard/index' });
    } else {
      Taro.navigateTo({ url });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileHeader}>
        <View className={styles.avatar}>
          <Text>👤</Text>
        </View>
        <View className={styles.profileInfo}>
          <Text className={styles.userName}>张三</Text>
          <View className={styles.roleTag}>
            <Text className={styles.roleTagText}>商场租户</Text>
          </View>
        </View>
      </View>

      <View className={styles.myStats}>
        <View className={styles.myStatItem}>
          <Text className={styles.myStatValue}>5</Text>
          <Text className={styles.myStatLabel}>已上报</Text>
        </View>
        <View className={styles.myStatItem}>
          <Text className={styles.myStatValue}>3</Text>
          <Text className={styles.myStatLabel}>整改中</Text>
        </View>
        <View className={styles.myStatItem}>
          <Text className={styles.myStatValue}>2</Text>
          <Text className={styles.myStatLabel}>已整改</Text>
        </View>
        <View className={styles.myStatItem}>
          <Text className={styles.myStatValue}>1</Text>
          <Text className={styles.myStatLabel}>培训签到</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        {menuItems.map((item, idx) => (
          <View key={idx} className={styles.menuItem} onClick={() => handleMenuClick(item.url)}>
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuLabel}>{item.label}</Text>
            <Text className={styles.menuArrow}>&gt;</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MinePage;
