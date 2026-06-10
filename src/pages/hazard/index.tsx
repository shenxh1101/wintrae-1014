import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { HazardStatus, HazardLevel } from '@/types';
import { useAppStore } from '@/store';
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

const levelFilters: { key: HazardLevel | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'high', label: '高风险' },
  { key: 'medium', label: '中风险' },
  { key: 'low', label: '低风险' }
];

const floorOptions = ['全部', '1F', '2F', '3F', '4F', '5F', 'B1'];

type DashboardView = 'new' | 'pending_rectify' | 'review_fail' | 'closed' | 'overdue' | null;

let preservedStatus: HazardStatus | 'all' = 'all';
let preservedLevel: HazardLevel | 'all' = 'all';
let preservedFloor = '全部';

const HazardPage: React.FC = () => {
  const router = useRouter();
  const initialView = (router.params.view as DashboardView) || null;
  const [activeStatus, setActiveStatus] = useState<HazardStatus | 'all'>(preservedStatus);
  const [activeLevel, setActiveLevel] = useState<HazardLevel | 'all'>(preservedLevel);
  const [activeFloor, setActiveFloor] = useState(preservedFloor);
  const [showFilter, setShowFilter] = useState(false);
  const [dashboardView, setDashboardView] = useState<DashboardView>(initialView);
  const hazards = useAppStore(s => s.hazards);
  const checkOverdue = useAppStore(s => s.checkOverdue);

  useDidShow(() => {
    useAppStore.getState();
    checkOverdue();
  });

  useEffect(() => {
    if (!dashboardView) return;
    switch (dashboardView) {
      case 'new':
        setActiveStatus('all');
        setActiveLevel('all');
        setActiveFloor('全部');
        break;
      case 'pending_rectify':
        setActiveStatus('pending');
        setActiveLevel('all');
        setActiveFloor('全部');
        break;
      case 'review_fail':
        setActiveStatus('processing');
        setActiveLevel('all');
        setActiveFloor('全部');
        break;
      case 'closed':
        setActiveStatus('closed');
        setActiveLevel('all');
        setActiveFloor('全部');
        break;
      case 'overdue':
        setActiveStatus('processing');
        setActiveLevel('all');
        setActiveFloor('全部');
        break;
    }
  }, [dashboardView]);

  const handleStatusChange = useCallback((key: HazardStatus | 'all') => {
    setActiveStatus(key);
    preservedStatus = key;
    setDashboardView(null);
  }, []);

  const handleLevelChange = useCallback((key: HazardLevel | 'all') => {
    setActiveLevel(key);
    preservedLevel = key;
  }, []);

  const handleFloorChange = useCallback((floor: string) => {
    setActiveFloor(floor);
    preservedFloor = floor;
  }, []);

  const todayDate = new Date().toISOString().slice(0, 10);
  const isToday = (timeStr?: string) => timeStr && timeStr.slice(0, 10) === todayDate;
  const isOverdue = (h: typeof hazards[number]) =>
    h.status === 'processing' && !!h.deadline && new Date(h.deadline) < new Date();
  const isReviewFail = (h: typeof hazards[number]) =>
    h.status === 'processing' && h.rectifyResult && h.rectifyResult.indexOf('不合格') > -1;

  const filteredList = useMemo(() => {
    let list = hazards.filter(h => {
      if (activeStatus !== 'all' && h.status !== activeStatus) return false;
      if (activeLevel !== 'all' && h.level !== activeLevel) return false;
      if (activeFloor !== '全部' && h.floor !== activeFloor) return false;
      return true;
    });

    switch (dashboardView) {
      case 'new':
        list = list.filter(h => isToday(h.reportTime));
        break;
      case 'pending_rectify':
        list = list.filter(h => h.status === 'pending');
        break;
      case 'review_fail':
        list = list.filter(isReviewFail);
        break;
      case 'closed':
        list = list.filter(h => h.status === 'closed');
        break;
      case 'overdue':
        list = list.filter(isOverdue);
        break;
    }

    return list;
  }, [activeStatus, activeLevel, activeFloor, hazards, dashboardView]);

  const hasActiveFilter = activeStatus !== 'all' || activeLevel !== 'all' || activeFloor !== '全部' || dashboardView !== null;

  const resetFilters = () => {
    handleStatusChange('all');
    handleLevelChange('all');
    handleFloorChange('全部');
    setDashboardView(null);
  };

  const dashboardViewLabel = (() => {
    switch (dashboardView) {
      case 'new': return '今日新增';
      case 'pending_rectify': return '待整改';
      case 'review_fail': return '复查不合格';
      case 'closed': return '已关闭';
      case 'overdue': return '逾期未处理';
      default: return null;
    }
  })();

  return (
    <View className={styles.container}>
      {dashboardViewLabel && (
        <View className={styles.viewTag}>
          <Text className={styles.viewTagText}>看板筛选：{dashboardViewLabel}</Text>
          <Text className={styles.viewTagClear} onClick={resetFilters}>清除</Text>
        </View>
      )}

      <View className={styles.filterBar}>
        <ScrollView className={styles.statusScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.statusRow}>
            {statusFilters.map(f => (
              <View
                key={f.key}
                className={classnames(styles.filterBtn, activeStatus === f.key && !dashboardView && styles.filterBtnActive)}
                onClick={() => handleStatusChange(f.key)}
              >
                <Text className={classnames(styles.filterText, activeStatus === f.key && !dashboardView && styles.filterTextActive)}>
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View
          className={classnames(styles.filterToggle, showFilter && styles.filterToggleActive)}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Text className={styles.filterToggleText}>
            筛选{hasActiveFilter ? `(${[dashboardViewLabel, activeStatus !== 'all' ? '状态' : '', activeLevel !== 'all' ? '风险' : '', activeFloor !== '全部' ? '楼层' : ''].filter(Boolean).join('+')})` : ''}
          </Text>
        </View>
      </View>

      {showFilter && (
        <View className={styles.advancedFilter}>
          <View className={styles.filterSection}>
            <Text className={styles.filterLabel}>风险等级</Text>
            <View className={styles.filterOptions}>
              {levelFilters.map(f => (
                <View
                  key={f.key}
                  className={classnames(styles.filterOptionBtn, activeLevel === f.key && styles.filterOptionBtnActive)}
                  onClick={() => handleLevelChange(f.key)}
                >
                  <Text className={classnames(styles.filterOptionText, activeLevel === f.key && styles.filterOptionTextActive)}>
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.filterSection}>
            <Text className={styles.filterLabel}>所在楼层</Text>
            <View className={styles.filterOptions}>
              {floorOptions.map(f => (
                <View
                  key={f}
                  className={classnames(styles.filterOptionBtn, activeFloor === f && styles.filterOptionBtnActive)}
                  onClick={() => handleFloorChange(f)}
                >
                  <Text className={classnames(styles.filterOptionText, activeFloor === f && styles.filterOptionTextActive)}>
                    {f}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          {hasActiveFilter && (
            <View className={styles.resetRow} onClick={resetFilters}>
              <Text className={styles.resetText}>重置筛选</Text>
            </View>
          )}
        </View>
      )}

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
