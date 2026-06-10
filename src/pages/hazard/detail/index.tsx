import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { hazardTypeMap, hazardLevelMap, hazardStatusMap } from '@/data/hazard';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import classnames from 'classnames';
import styles from './index.module.scss';

const HazardDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || 'HZ001';
  const getHazardById = useAppStore(s => s.getHazardById);
  const [hazard, setHazard] = useState(() => getHazardById(id));

  useDidShow(() => {
    setHazard(getHazardById(id));
  });

  if (!hazard) {
    return (
      <View className={styles.container}>
        <View style={{ padding: 120, textAlign: 'center' }}>
          <Text>未找到该隐患记录</Text>
        </View>
      </View>
    );
  }

  const timeline = [
    { label: '隐患上报', time: hazard.reportTime, desc: `${hazard.reporter} 上报了隐患`, active: true },
    { label: '受理分配', time: hazard.inspector ? hazard.reportTime : '', desc: hazard.inspector ? `已指派 ${hazard.inspector} 处理` : '等待受理', active: !!hazard.inspector },
    { label: '整改中', time: hazard.rectifyRequirement ? hazard.reportTime : '', desc: hazard.rectifyRequirement || '等待整改', active: !!hazard.rectifyRequirement },
    { label: '复查验收', time: hazard.reviewTime || '', desc: hazard.rectifyResult || '等待复查', active: !!hazard.rectifyResult }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.imageSection}>
        <Image className={styles.heroImage} src={hazard.imageUrl} mode="aspectFill" />
      </View>

      <View className={styles.content}>
        <View className={styles.mainCard}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{hazard.title}</Text>
            <StatusTag status={hazard.status} statusMap={hazardStatusMap} />
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>类型：</Text>
              <Text className={styles.infoValue}>{hazardTypeMap[hazard.type]}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>等级：</Text>
              <StatusTag status={hazard.level} statusMap={hazardLevelMap} />
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>楼层：</Text>
              <Text className={styles.infoValue}>{hazard.floor}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>位置：</Text>
              <Text className={styles.infoValue}>{hazard.location}</Text>
            </View>
            {hazard.deadline && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>期限：</Text>
                <Text className={styles.infoValue}>{hazard.deadline}</Text>
              </View>
            )}
            {hazard.reporter && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>上报人：</Text>
                <Text className={styles.infoValue}>{hazard.reporter}</Text>
              </View>
            )}
          </View>
          <Text className={styles.descTitle}>隐患描述</Text>
          <Text className={styles.descText}>{hazard.description}</Text>
        </View>

        <View className={styles.timelineCard}>
          <Text className={styles.timelineTitle}>处理进度</Text>
          <View className={styles.timeline}>
            {timeline.map((item, idx) => (
              <View key={idx} className={styles.timelineItem}>
                <View className={classnames(styles.timelineDot, item.active && styles.timelineDotActive)} />
                <Text className={styles.timelineLabel}>{item.label}</Text>
                {item.time && <Text className={styles.timelineTime}>{item.time}</Text>}
                {item.desc && <Text className={styles.timelineDesc}>{item.desc}</Text>}
              </View>
            ))}
          </View>
        </View>

        {hazard.rectifyRequirement && (
          <View className={styles.rectifyCard}>
            <Text className={styles.rectifyTitle}>整改信息</Text>
            <View className={styles.rectifyItem}>
              <Text className={styles.rectifyLabel}>整改要求</Text>
              <Text className={styles.rectifyValue}>{hazard.rectifyRequirement}</Text>
            </View>
            {hazard.inspector && (
              <View className={styles.rectifyItem}>
                <Text className={styles.rectifyLabel}>整改负责人</Text>
                <Text className={styles.rectifyValue}>{hazard.inspector}</Text>
              </View>
            )}
            {hazard.deadline && (
              <View className={styles.rectifyItem}>
                <Text className={styles.rectifyLabel}>整改期限</Text>
                <Text className={styles.rectifyValue}>{hazard.deadline}</Text>
              </View>
            )}
            {hazard.rectifyResult && (
              <View className={styles.rectifyItem}>
                <Text className={styles.rectifyLabel}>复查结论</Text>
                <Text className={styles.rectifyValue}>{hazard.rectifyResult}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {(hazard.status === 'pending' || hazard.status === 'processing') && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(styles.actionBtn, styles.actionBtnSecondary)}
            onClick={() => Taro.navigateBack()}
          >
            <Text className={classnames(styles.actionBtnText, styles.actionBtnTextSecondary)}>返回</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
            onClick={() => Taro.navigateTo({ url: `/pages/rectify/index?id=${hazard.id}` })}
          >
            <Text className={styles.actionBtnText}>
              {hazard.status === 'pending' ? '填写整改' : '复查验收'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default HazardDetailPage;
