import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { UserRole } from '@/types';
import { useAppStore } from '@/store';
import HazardCard from '@/components/HazardCard';
import classnames from 'classnames';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('tenant');
  const hazards = useAppStore(s => s.hazards);
  const checkOverdue = useAppStore(s => s.checkOverdue);
  const messages = useAppStore(s => s.messages);

  useDidShow(() => {
    useAppStore.getState();
    checkOverdue();
  });

  const todayDate = new Date().toISOString().slice(0, 10);
  const isToday = (timeStr?: string) => timeStr && timeStr.slice(0, 10) === todayDate;

  const boardStats = useMemo(() => {
    const newCount = hazards.filter(h => isToday(h.reportTime)).length;
    const pendingRectify = hazards.filter(h => h.status === 'pending').length;
    const reviewFailCount = hazards.filter(h =>
      h.status === 'processing' && h.rectifyResult && h.rectifyResult.indexOf('不合格') > -1
    ).length;
    const closedCount = hazards.filter(h => h.status === 'closed').length;
    const overdueCount = hazards.filter(h =>
      h.status === 'processing' && h.deadline && new Date(h.deadline) < new Date()
    ).length;
    return { newCount, pendingRectify, reviewFailCount, closedCount, overdueCount };
  }, [hazards]);

  const unreadMsgCount = messages.filter(m => !m.read).length;
  const recentHazards = hazards.filter(h => h.status !== 'closed').slice(0, 3);

  const goBoardView = (view: string) => {
    Taro.switchTab({
      url: '/pages/hazard/index',
      success: () => {
        Taro.navigateTo({ url: `/pages/hazard/index?view=${view}` });
      },
      fail: () => {
        Taro.navigateTo({ url: `/pages/hazard/index?view=${view}` });
      }
    });
  };

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
      </View>

      <View className={styles.loopBoard}>
        <View className={styles.boardHeader}>
          <Text className={styles.boardTitle}>今日闭环看板</Text>
          <Text className={styles.boardSubtitle}>点击数字进入对应列表</Text>
        </View>
        <View className={styles.boardMain}>
          <View className={styles.boardItem} onClick={() => goBoardView('new')}>
            <Text className={classnames(styles.boardValue, styles.boardValueNew)}>{boardStats.newCount}</Text>
            <Text className={styles.boardLabel}>新增隐患</Text>
          </View>
          <View className={styles.boardItem} onClick={() => goBoardView('pending_rectify')}>
            <Text className={classnames(styles.boardValue, styles.boardValuePending)}>{boardStats.pendingRectify}</Text>
            <Text className={styles.boardLabel}>待整改</Text>
          </View>
          <View className={styles.boardItem} onClick={() => goBoardView('review_fail')}>
            <Text className={classnames(styles.boardValue, styles.boardValueFail)}>{boardStats.reviewFailCount}</Text>
            <Text className={styles.boardLabel}>复查不合格</Text>
          </View>
          <View className={styles.boardItem} onClick={() => goBoardView('closed')}>
            <Text className={classnames(styles.boardValue, styles.boardValueClosed)}>{boardStats.closedCount}</Text>
            <Text className={styles.boardLabel}>已关闭</Text>
          </View>
          <View className={styles.boardItem} onClick={() => goBoardView('overdue')}>
            <Text className={classnames(styles.boardValue, styles.boardValueOverdue)}>{boardStats.overdueCount}</Text>
            <Text className={styles.boardLabel}>逾期未处理</Text>
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

      {boardStats.pendingRectify > 0 && (
        <View className={styles.section}>
          <View className={styles.alertCard}>
            <Text className={styles.alertIcon}>⚠️</Text>
            <View className={styles.alertContent}>
              <Text className={styles.alertTitle}>{boardStats.pendingRectify}项隐患待处理</Text>
              <Text className={styles.alertDesc}>请尽快处理，避免安全风险</Text>
            </View>
          </View>
        </View>
      )}

      {unreadMsgCount > 0 && (
        <View className={styles.section}>
          <View className={classnames(styles.alertCard, styles.alertCardInfo)} onClick={() => Taro.switchTab({ url: '/pages/message/index' })}>
            <Text className={styles.alertIcon}>🔔</Text>
            <View className={styles.alertContent}>
              <Text className={styles.alertTitle}>{unreadMsgCount}条未读消息</Text>
              <Text className={styles.alertDesc}>点击查看消息中心</Text>
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
