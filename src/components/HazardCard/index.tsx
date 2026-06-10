import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { HazardItem } from '@/types';
import { hazardTypeMap, hazardLevelMap, hazardStatusMap } from '@/data/hazard';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface HazardCardProps {
  data: HazardItem;
}

const HazardCard: React.FC<HazardCardProps> = ({ data }) => {
  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/hazard/detail/index?id=${data.id}` });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image className={styles.image} src={data.imageUrl} mode="aspectFill" />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{data.title}</Text>
          <StatusTag status={data.level} statusMap={hazardLevelMap} />
        </View>
        <View className={styles.info}>
          <Text className={styles.type}>{hazardTypeMap[data.type]}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.location}>{data.location}</Text>
        </View>
        <View className={styles.footer}>
          <View className={styles.footerLeft}>
            <Text className={styles.time}>{data.reportTime}</Text>
            {data.sourcePointName && (
              <Text className={styles.source}>巡检: {data.sourcePointName}</Text>
            )}
          </View>
          <StatusTag status={data.status} statusMap={hazardStatusMap} />
        </View>
      </View>
    </View>
  );
};

export default HazardCard;
