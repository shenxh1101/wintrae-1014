import React, { useState } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { HazardType, HazardLevel } from '@/types';
import { hazardTypeMap } from '@/data/hazard';
import classnames from 'classnames';
import styles from './index.module.scss';

const hazardTypes: HazardType[] = ['channel_block', 'illegal_power', 'extinguisher_missing', 'fire_door', 'other'];

const HazardReportPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<HazardType>('channel_block');
  const [selectedLevel, setSelectedLevel] = useState<HazardLevel>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 3 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setPhotos(prev => [...prev, ...res.tempFilePaths].slice(0, 3));
      },
      fail: (err) => {
        console.error('[HazardReport] chooseImage failed:', err);
      }
    });
  };

  const handleSubmit = () => {
    if (!location.trim()) {
      Taro.showToast({ title: '请填写隐患位置', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请填写隐患描述', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '上报成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>现场照片</Text>
        <View className={styles.photoArea}>
          {photos.map((photo, idx) => (
            <View key={idx} className={styles.photoItem}>
              <Image className={styles.photoImg} src={photo} mode="aspectFill" />
            </View>
          ))}
          {photos.length < 3 && (
            <View className={styles.photoAdd} onClick={handleAddPhoto}>
              <Text className={styles.photoAddIcon}>+</Text>
              <Text className={styles.photoAddText}>添加照片</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>隐患类型</Text>
        <View className={styles.typeGrid}>
          {hazardTypes.map(type => (
            <View
              key={type}
              className={classnames(styles.typeItem, selectedType === type && styles.typeItemActive)}
              onClick={() => setSelectedType(type)}
            >
              <Text className={classnames(styles.typeText, selectedType === type && styles.typeTextActive)}>
                {hazardTypeMap[type]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>风险等级</Text>
        <View className={styles.levelRow}>
          <View
            className={classnames(styles.levelItem, styles.levelHigh, selectedLevel === 'high' && styles.levelItemActive)}
            onClick={() => setSelectedLevel('high')}
          >
            <Text className={classnames(styles.levelText, styles.levelTextHigh)}>高风险</Text>
          </View>
          <View
            className={classnames(styles.levelItem, styles.levelMedium, selectedLevel === 'medium' && styles.levelItemActive)}
            onClick={() => setSelectedLevel('medium')}
          >
            <Text className={classnames(styles.levelText, styles.levelTextMedium)}>中风险</Text>
          </View>
          <View
            className={classnames(styles.levelItem, styles.levelLow, selectedLevel === 'low' && styles.levelItemActive)}
            onClick={() => setSelectedLevel('low')}
          >
            <Text className={classnames(styles.levelText, styles.levelTextLow)}>低风险</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.inputRow}>
          <Text className={styles.inputLabel}>隐患位置</Text>
          <Input
            className={styles.inputField}
            placeholder="请输入隐患所在位置"
            value={location}
            onInput={e => setLocation(e.detail.value)}
          />
        </View>
        <View className={styles.inputRow}>
          <Text className={styles.inputLabel}>详细描述</Text>
          <Textarea
            className={styles.textArea}
            placeholder="请详细描述隐患情况"
            value={description}
            onInput={e => setDescription(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitText}>提交上报</Text>
        </View>
      </View>
    </View>
  );
};

export default HazardReportPage;
