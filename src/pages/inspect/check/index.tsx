import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store';
import classnames from 'classnames';
import styles from './index.module.scss';

const InspectCheckPage: React.FC = () => {
  const router = useRouter();
  const routeId = router.params.id || 'IR002';
  const getRouteById = useAppStore(s => s.getRouteById);
  const checkPoint = useAppStore(s => s.checkPoint);
  const completeRoute = useAppStore(s => s.completeRoute);

  const [route, setRoute] = useState(() => getRouteById(routeId));

  useDidShow(() => {
    const r = getRouteById(routeId);
    if (r) setRoute(r);
  });

  if (!route) {
    return (
      <View className={styles.container}>
        <View style={{ padding: 120, textAlign: 'center' }}>
          <Text>未找到该巡检路线</Text>
        </View>
      </View>
    );
  }

  const checkedCount = route.points.filter(p => p.checked).length;
  const totalCount = route.points.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleCheck = (pointId: string) => {
    const point = route.points.find(p => p.id === pointId);
    if (point?.checked) return;
    checkPoint(routeId, pointId);
    const r = getRouteById(routeId);
    if (r) setRoute(r);
    Taro.showToast({ title: '打卡成功', icon: 'success', duration: 1000 });
  };

  const handleFinish = () => {
    const current = getRouteById(routeId);
    if (!current) return;
    const curChecked = current.points.filter(p => p.checked).length;
    const curTotal = current.points.length;

    if (curChecked < curTotal) {
      Taro.showModal({
        title: '提示',
        content: `还有${curTotal - curChecked}个点未打卡，确认结束？`,
        success: (res) => {
          if (res.confirm) {
            completeRoute(routeId);
            const r = getRouteById(routeId);
            if (r) setRoute(r);
            Taro.showToast({ title: '巡检已结束', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1200);
          }
        }
      });
      return;
    }
    completeRoute(routeId);
    const r = getRouteById(routeId);
    if (r) setRoute(r);
    Taro.showToast({ title: '巡检完成', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.routeName}>{route.name}</Text>
        <View className={styles.progressRow}>
          <View className={styles.progressBg}>
            <View className={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>
          <Text className={styles.progressText}>{checkedCount}/{totalCount}</Text>
        </View>
      </View>

      <View className={styles.pointList}>
        {route.points.map(point => {
          const isChecked = point.checked;
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

      {route.status !== 'completed' && (
        <View className={styles.bottomBar}>
          <View className={styles.finishBtn} onClick={handleFinish}>
            <Text className={styles.finishText}>
              {checkedCount === totalCount ? '完成巡检' : '结束巡检'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default InspectCheckPage;
