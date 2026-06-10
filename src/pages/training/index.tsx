import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store';
import classnames from 'classnames';
import styles from './index.module.scss';

const TrainingPage: React.FC = () => {
  const trainings = useAppStore(s => s.trainings);
  const signInTraining = useAppStore(s => s.signInTraining);
  const [_, forceUpdate] = useState(0);

  useDidShow(() => {
    forceUpdate(n => n + 1);
  });

  const handleSignIn = (id: string, currentSigned: boolean) => {
    if (currentSigned) {
      Taro.showToast({ title: '您已签到，请勿重复签到', icon: 'none' });
      return;
    }

    Taro.getLocation({
      type: 'gcj02',
      success: () => {
        doSign(id);
      },
      fail: (err) => {
        console.warn('[Training] getLocation warn:', err);
        doSign(id);
      }
    });
  };

  const doSign = (id: string) => {
    signInTraining(id);
    const fresh = useAppStore.getState().trainings.find(t => t.id === id);
    if (fresh?.signedIn) {
      Taro.showToast({ title: '签到成功', icon: 'success' });
    }
    forceUpdate(n => n + 1);
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
                  className={classnames(
                    styles.signBtn,
                    item.signedIn ? styles.signBtnDone : styles.signBtnActive
                  )}
                  onClick={() => handleSignIn(item.id, item.signedIn)}
                >
                  <Text className={classnames(
                    styles.signBtnText,
                    item.signedIn ? styles.signBtnTextDone : styles.signBtnTextActive
                  )}>
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
                  <Text className={styles.signedTime}>✅ 签到时间：{item.signTime}</Text>
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
