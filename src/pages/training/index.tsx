import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { trainingList } from '@/data/training';
import classnames from 'classnames';
import styles from './index.module.scss';

const TrainingPage: React.FC = () => {
  const [trainings, setTrainings] = useState(trainingList);

  const handleSignIn = (id: string) => {
    Taro.getLocation({
      type: 'gcj02',
      success: () => {
        setTrainings(prev =>
          prev.map(t =>
            t.id === id
              ? { ...t, signedIn: true, signTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
              : t
          )
        );
        Taro.showToast({ title: '签到成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Training] getLocation failed:', err);
        setTrainings(prev =>
          prev.map(t =>
            t.id === id
              ? { ...t, signedIn: true, signTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
              : t
          )
        );
        Taro.showToast({ title: '签到成功', icon: 'success' });
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>消防安全培训</Text>
        <Text className={styles.headerDesc}>参加培训并完成签到，提升消防安全意识</Text>
      </View>

      <View className={styles.list}>
        {trainings.length > 0 ? (
          trainings.map(item => (
            <View key={item.id} className={styles.trainCard}>
              <View className={styles.trainHeader}>
                <Text className={styles.trainTitle}>{item.title}</Text>
                <View
                  className={classnames(styles.signBtn, item.signedIn ? styles.signBtnDone : styles.signBtnActive)}
                  onClick={() => !item.signedIn && handleSignIn(item.id)}
                >
                  <Text className={classnames(styles.signBtnText, item.signedIn ? styles.signBtnTextDone : styles.signBtnTextActive)}>
                    {item.signedIn ? '已签到' : '签到'}
                  </Text>
                </View>
              </View>
              <View className={styles.trainInfo}>
                <View className={styles.trainInfoRow}>
                  <Text className={styles.trainInfoIcon}>👨‍🏫</Text>
                  <Text className={styles.trainInfoText}>{item.trainer}</Text>
                </View>
                <View className={styles.trainInfoRow}>
                  <Text className={styles.trainInfoIcon}>📍</Text>
                  <Text className={styles.trainInfoText}>{item.location}</Text>
                </View>
                <View className={styles.trainInfoRow}>
                  <Text className={styles.trainInfoIcon}>🕐</Text>
                  <Text className={styles.trainInfoText}>{item.time} · {item.duration}</Text>
                </View>
                {item.signedIn && item.signTime && (
                  <Text className={styles.signedTime}>签到时间：{item.signTime}</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无培训活动</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TrainingPage;
