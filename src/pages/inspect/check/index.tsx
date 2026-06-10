import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { inspectionRoutes } from '@/data/inspection';
import classnames from 'classnames';
import styles from './index.module.scss';

const InspectCheckPage: React.FC = () => {
  const router = useRouter();
  const routeId = router.params.id || 'IR002';
  const routeData = inspectionRoutes.find(r => r.id === routeId) || inspectionRoutes[1];

  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(routeData.points.filter(p => p.checked).map(p => p.id))
  );

  const checkedCount = checkedIds.size;
  const totalCount = routeData.points.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleCheck = (pointId: string) => {
    if (checkedIds.has(pointId)) return;
    const newSet = new Set(checkedIds);
    newSet.add(pointId);
    setCheckedIds(newSet);
    Taro.showToast({ title: '打卡成功', icon: 'success', duration: 1000 });
  };

  const handleFinish = () => {
    if (checkedCount < totalCount) {
      Taro.showToast({ title: `还有${totalCount - checkedCount}个点未打卡`, icon: 'none' });
      return;
    }
    Taro.showToast({ title: '巡检完成', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.routeName}>{routeData.name}</Text>
        <View className={styles.progressRow}>
          <View className={styles.progressBg}>
            <View className={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>
          <Text className={styles.progressText}>{checkedCount}/{totalCount}</Text>
        </View>
      </View>

      <View className={styles.pointList}>
        {routeData.points.map(point => {
          const isChecked = checkedIds.has(point.id);
          return (
            <View key={point.id} className={styles.pointCard}>
              <View className={styles.pointHeader}>
                <Text className={styles.pointName}>{point.name}</Text>
                <View
                  className={classnames(styles.checkBtn, isChecked ? styles.checkBtnDone : styles.checkBtnPending)}
                  onClick={() => handleCheck(point.id)}
                >
                  <Text className={classnames(styles.checkBtnText, isChecked ? styles.checkBtnTextDone : styles.checkBtnTextPending)}>
                    {isChecked ? '已打卡' : '打卡'}
                  </Text>
                </View>
              </View>
              <View className={styles.pointInfo}>
                <Text className={styles.pointLocation}>{point.location}</Text>
                {point.checkTime && <Text className={styles.pointTime}>{point.checkTime}</Text>}
              </View>
              {point.remark && <Text className={styles.pointRemark}>{point.remark}</Text>}
            </View>
          );
        })}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.finishBtn} onClick={handleFinish}>
          <Text className={styles.finishText}>完成巡检</Text>
        </View>
      </View>
    </View>
  );
};

export default InspectCheckPage;
