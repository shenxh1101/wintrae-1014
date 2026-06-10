import React, { useState, useMemo } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { hazardStatusMap } from '@/data/hazard';
import classnames from 'classnames';
import styles from './index.module.scss';

const statusColorMap: Record<string, string> = {
  pending: '#FF7D00',
  processing: '#2B5FD9',
  rectified: '#00B42A',
  closed: '#86909C',
};

const InspectCheckPage: React.FC = () => {
  const router = useRouter();
  const routeId = router.params.id || 'IR002';
  const getRouteById = useAppStore(s => s.getRouteById);
  const checkPoint = useAppStore(s => s.checkPoint);
  const completeRoute = useAppStore(s => s.completeRoute);
  const addHazard = useAppStore(s => s.addHazard);
  const getHazardById = useAppStore(s => s.getHazardById);
  const hazards = useAppStore(s => s.hazards);

  const [route, setRoute] = useState(() => getRouteById(routeId));
  const [reportingPointId, setReportingPointId] = useState<string | null>(null);
  const [reportRemark, setReportRemark] = useState('');
  const [reportImageUrl, setReportImageUrl] = useState('');

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

  const isCompleted = route.status === 'completed';
  const checkedCount = route.points.filter(p => p.checked).length;
  const totalCount = route.points.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const hazardStatusForPoint = useMemo(() => {
    const map: Record<string, { status?: string; closed?: boolean; title?: string }> = {};
    route.points.forEach(p => {
      if (p.anomalyHazardId) {
        const h = hazards.find(hz => hz.id === p.anomalyHazardId);
        map[p.id] = {
          status: h?.status,
          closed: p.anomalyClosed,
          title: h?.title,
        };
      }
    });
    return map;
  }, [route.points, hazards]);

  const handleCheck = (pointId: string) => {
    const point = route.points.find(p => p.id === pointId);
    if (point?.checked || isCompleted) return;
    checkPoint(routeId, pointId);
    const r = getRouteById(routeId);
    if (r) setRoute(r);
    Taro.showToast({ title: '打卡成功', icon: 'success', duration: 1000 });
  };

  const handleReportAnomaly = (pointId: string) => {
    const point = route.points.find(p => p.id === pointId);
    if (!point || isCompleted) return;
    setReportingPointId(pointId);
    setReportRemark('');
    setReportImageUrl('');
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setReportImageUrl(res.tempFilePaths[0]);
      }
    });
  };

  const handleSubmitAnomaly = () => {
    if (!reportingPointId) return;
    const point = route.points.find(p => p.id === reportingPointId);
    if (!point) return;

    addHazard({
      type: 'other',
      level: 'high',
      location: `${point.floor} ${point.location}`,
      floor: point.floor,
      description: reportRemark || `巡检点位「${point.name}」发现异常`,
      imageUrl: reportImageUrl || 'https://picsum.photos/400/300?random=anomaly',
      sourcePointId: reportingPointId,
      sourceRouteId: routeId,
      sourcePointName: point.name,
      sourceRouteName: route.name,
    });

    setReportingPointId(null);
    setReportRemark('');
    setReportImageUrl('');
    const r = getRouteById(routeId);
    if (r) setRoute(r);
    Taro.showToast({ title: '异常已上报', icon: 'success' });
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

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.backBtn} onClick={handleBack}>
            <Text className={styles.backIcon}>←</Text>
          </View>
          <Text className={styles.routeName}>{route.name}</Text>
          <View className={classnames(styles.routeStatusTag, isCompleted && styles.routeStatusTagDone)}>
            <Text className={styles.routeStatusText}>
              {isCompleted ? '已完成' : route.status === 'pending' ? '待开始' : '进行中'}
            </Text>
          </View>
        </View>
        <View className={styles.progressRow}>
          <View className={styles.progressBg}>
            <View
              className={classnames(styles.progressFill, isCompleted && styles.progressFillDone)}
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className={styles.progressText}>{checkedCount}/{totalCount}</Text>
        </View>
        {route.startTime && (
          <View className={styles.timeInfo}>
            <Text className={styles.timeInfoText}>开始：{route.startTime}</Text>
            {route.endTime && <Text className={styles.timeInfoText}>结束：{route.endTime}</Text>}
          </View>
        )}
      </View>

      <View className={styles.pointList}>
        {route.points.map(point => {
          const isChecked = point.checked;
          const hasAnomaly = !!point.anomalyHazardId;
          const anomalyClosed = !!point.anomalyClosed;
          const hazardInfo = hazardStatusForPoint[point.id];
          return (
            <View
              key={point.id}
              className={classnames(styles.pointCard, hasAnomaly && styles.pointCardAnomaly)}
            >
              <View className={styles.pointHeader}>
                <View className={styles.pointNameRow}>
                  <Text className={styles.pointName}>{point.name}</Text>
                  {isChecked && <View className={styles.checkIcon}><Text>✓</Text></View>}
                </View>
                <View className={styles.pointActions}>
                  {!hasAnomaly && !isCompleted && (
                    <View
                      className={classnames(styles.reportBtn)}
                      onClick={() => handleReportAnomaly(point.id)}
                    >
                      <Text className={styles.reportBtnText}>异常上报</Text>
                    </View>
                  )}
                  {hasAnomaly && hazardInfo?.status && (
                    <View
                      className={styles.hazardStatusTag}
                      style={{ background: `${statusColorMap[hazardInfo.status]}15` }}
                      onClick={() => {
                        if (point.anomalyHazardId) {
                          Taro.navigateTo({ url: `/pages/hazard/detail/index?id=${point.anomalyHazardId}` });
                        }
                      }}
                    >
                      <View className={styles.hazardDot} style={{ background: statusColorMap[hazardInfo.status] }} />
                      <Text className={styles.hazardStatusText} style={{ color: statusColorMap[hazardInfo.status] }}>
                        {hazardStatusMap[hazardInfo.status]?.label || hazardInfo.status}
                      </Text>
                    </View>
                  )}
                  {hasAnomaly && (
                    <View
                      className={classnames(styles.anomalyTag, anomalyClosed ? styles.anomalyTagClosed : styles.anomalyTagOpen)}
                      onClick={() => {
                        if (point.anomalyHazardId) {
                          Taro.navigateTo({ url: `/pages/hazard/detail/index?id=${point.anomalyHazardId}` });
                        }
                      }}
                    >
                      <Text className={styles.anomalyTagText}>
                        {anomalyClosed ? '已闭环' : '待处理'}
                      </Text>
                    </View>
                  )}
                  {!isCompleted && (
                    <View
                      className={classnames(styles.checkBtn, isChecked ? styles.checkBtnDone : styles.checkBtnPending)}
                      onClick={() => handleCheck(point.id)}
                    >
                      <Text className={classnames(styles.checkBtnText, isChecked ? styles.checkBtnTextDone : styles.checkBtnTextPending)}>
                        {isChecked ? '已打卡' : '打卡'}
                      </Text>
                    </View>
                  )}
                  {isCompleted && isChecked && (
                    <View className={classnames(styles.checkBtn, styles.checkBtnDone)}>
                      <Text className={classnames(styles.checkBtnText, styles.checkBtnTextDone)}>已完成</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className={styles.pointInfo}>
                <Text className={styles.pointLocation}>{point.floor} · {point.location}</Text>
                {point.checkTime && <Text className={styles.pointTime}>{point.checkTime}</Text>}
              </View>
              {hasAnomaly && hazardInfo?.title && (
                <View className={styles.pointAnomalyInfo} onClick={() => {
                  if (point.anomalyHazardId) {
                    Taro.navigateTo({ url: `/pages/hazard/detail/index?id=${point.anomalyHazardId}` });
                  }
                }}>
                  <Text className={styles.pointAnomalyLabel}>关联隐患：</Text>
                  <Text className={styles.pointAnomalyValue}>{hazardInfo.title}</Text>
                </View>
              )}
              {point.remark && <Text className={styles.pointRemark}>巡检备注：{point.remark}</Text>}
            </View>
          );
        })}
      </View>

      {reportingPointId && (
        <View className={styles.reportModal}>
          <View className={styles.reportContent}>
            <Text className={styles.reportTitle}>异常上报</Text>
            <Text className={styles.reportPoint}>
              点位：{route.points.find(p => p.id === reportingPointId)?.name}
            </Text>
            <Text className={styles.reportRoute}>
              路线：{route.name} · 楼层：{route.points.find(p => p.id === reportingPointId)?.floor}
            </Text>
            <View className={styles.imageRow} onClick={handleChooseImage}>
              {reportImageUrl ? (
                <Image className={styles.previewImage} src={reportImageUrl} mode="aspectFill" />
              ) : (
                <View className={styles.addImageBtn}>
                  <Text className={styles.addImageText}>+ 拍照</Text>
                </View>
              )}
            </View>
            <Textarea
              className={styles.reportInput}
              placeholder="请描述异常情况"
              value={reportRemark}
              onInput={e => setReportRemark(e.detail.value)}
              maxlength={200}
            />
            <View className={styles.reportBtns}>
              <View className={styles.cancelBtn} onClick={() => setReportingPointId(null)}>
                <Text className={styles.cancelBtnText}>取消</Text>
              </View>
              <View className={styles.submitBtn} onClick={handleSubmitAnomaly}>
                <Text className={styles.submitBtnText}>提交上报</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {route.status !== 'completed' && !reportingPointId && (
        <View className={styles.bottomBar}>
          <View className={styles.finishBtn} onClick={handleFinish}>
            <Text className={styles.finishText}>
              {checkedCount === totalCount ? '完成巡检' : '结束巡检'}
            </Text>
          </View>
        </View>
      )}

      {isCompleted && !reportingPointId && (
        <View className={styles.bottomBar}>
          <View className={styles.backToListBtn} onClick={handleBack}>
            <Text className={styles.backToListText}>返回巡检列表</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default InspectCheckPage;
