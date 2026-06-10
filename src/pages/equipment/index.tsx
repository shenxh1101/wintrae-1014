import React, { useState, useMemo } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { equipmentList } from '@/data/equipment';
import classnames from 'classnames';
import styles from './index.module.scss';

const typeOptions = ['全部', '灭火器', '消火栓', '防火门', '报警器', '应急灯', '指示灯', '水带'];

const EquipmentPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [activeType, setActiveType] = useState('全部');

  const filteredList = useMemo(() => {
    return equipmentList.filter(item => {
      const matchType = activeType === '全部' || item.type === activeType;
      const matchKeyword = !keyword || item.name.includes(keyword) || item.location.includes(keyword) || item.position.includes(keyword);
      return matchType && matchKeyword;
    });
  }, [keyword, activeType]);

  const handleScan = () => {
    Taro.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.info('[Equipment] scanCode result:', res.result);
        const code = res.result;
        const found = equipmentList.find(e => e.qrCode === code);
        if (found) {
          Taro.showToast({ title: `找到：${found.name}`, icon: 'success' });
        } else {
          Taro.showToast({ title: '未找到对应器材', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('[Equipment] scanCode failed:', err);
        Taro.showToast({ title: '扫码取消', icon: 'none' });
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder="搜索器材名称、位置或编号"
          value={keyword}
          onInput={e => setKeyword(e.detail.value)}
        />
      </View>

      <View className={styles.scanBtn} onClick={handleScan}>
        <Text className={styles.scanIcon}>📷</Text>
        <Text className={styles.scanText}>扫码查询器材</Text>
      </View>

      <View className={styles.typeFilter}>
        {typeOptions.map(type => (
          <View
            key={type}
            className={classnames(styles.typeBtn, activeType === type && styles.typeBtnActive)}
            onClick={() => setActiveType(type)}
          >
            <Text className={classnames(styles.typeBtnText, activeType === type && styles.typeBtnTextActive)}>
              {type}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.equipList}>
        {filteredList.length > 0 ? (
          filteredList.map(item => (
            <View key={item.id} className={styles.equipCard}>
              <View className={styles.equipTop}>
                <Image className={styles.equipImage} src={item.imageUrl} mode="aspectFill" />
                <View className={styles.equipInfo}>
                  <Text className={styles.equipName}>{item.name}</Text>
                  <Text className={styles.equipType}>类型：{item.type}</Text>
                  <Text className={styles.equipLocation}>{item.floor} · {item.location}</Text>
                </View>
              </View>
              <View className={styles.equipDetail}>
                <View className={styles.detailItem}>
                  <Text className={styles.detailLabel}>有效期至</Text>
                  <Text className={styles.detailValue}>{item.expireDate}</Text>
                </View>
                <View className={styles.detailItem}>
                  <Text className={styles.detailLabel}>最近检查</Text>
                  <Text className={styles.detailValue}>{item.lastCheckDate}</Text>
                </View>
                <View className={styles.detailItem}>
                  <Text className={styles.detailLabel}>状态</Text>
                  <Text className={classnames(
                    styles.detailValue,
                    item.lastCheckResult === 'normal' ? styles.checkResultNormal : styles.checkResultAbnormal
                  )}>
                    {item.lastCheckResult === 'normal' ? '正常' : '异常'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🧯</Text>
            <Text className={styles.emptyText}>未找到相关器材</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default EquipmentPage;
