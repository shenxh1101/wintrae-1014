import React, { useState, useMemo, useRef } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow, nextTick } from '@tarojs/taro';
import { useAppStore } from '@/store';
import classnames from 'classnames';
import styles from './index.module.scss';

const typeOptions = ['全部', '灭火器', '消火栓', '防火门', '报警器', '应急灯', '指示灯', '水带'];

const EquipmentPage: React.FC = () => {
  const router = useRouter();
  const urlHighlightId = router.params.highlightId || '';
  const [keyword, setKeyword] = useState('');
  const [activeType, setActiveType] = useState('全部');
  const [highlightId, setHighlightId] = useState<string | null>(urlHighlightId || null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollRef = useRef<any>(null);

  const equipments = useAppStore(s => s.equipments);
  const getEquipmentByCode = useAppStore(s => s.getEquipmentByCode);

  useDidShow(() => {
    useAppStore.getState();
  });

  const filteredList = useMemo(() => {
    return equipments.filter(item => {
      const matchType = activeType === '全部' || item.type === activeType;
      const matchKeyword = !keyword || item.name.includes(keyword) || item.location.includes(keyword) || item.position.includes(keyword) || item.qrCode.includes(keyword);
      return matchType && matchKeyword;
    });
  }, [keyword, activeType, equipments]);

  const handleSearchByCode = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const found = getEquipmentByCode(trimmed);
    if (found) {
      setHighlightId(found.id);
      setExpandedId(found.id);
      setActiveType('全部');
      nextTick(() => {
        Taro.showToast({ title: '已定位到器材', icon: 'success' });
      });
    } else {
      setScanResult(`未找到编号「${trimmed}」对应的器材`);
      setHighlightId(null);
      Taro.showToast({ title: '未找到对应器材', icon: 'none', duration: 2000 });
    }
  };

  const handleScan = () => {
    Taro.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        const code = res.result;
        const found = getEquipmentByCode(code);
        if (found) {
          setKeyword('');
          setActiveType('全部');
          setScanResult(found.id);
          setHighlightId(found.id);
          setExpandedId(found.id);
          nextTick(() => {
            Taro.showToast({ title: '已定位到器材', icon: 'success' });
          });
        } else {
          setScanResult(`未找到编号「${code}」对应的器材`);
          Taro.showToast({ title: '未找到对应器材', icon: 'none', duration: 2000 });
        }
      },
      fail: () => {
        Taro.showToast({ title: '扫码取消', icon: 'none' });
      }
    });
  };

  const handleScrollToItem = (id: string) => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView?.({ id: `equip-${id}`, behavior: 'smooth', block: 'start' });
    }
  };

  React.useEffect(() => {
    if (highlightId && filteredList.findIndex(e => e.id === highlightId) >= 0) {
      handleScrollToItem(highlightId);
    }
  }, [highlightId, filteredList]);

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder="输入编号、名称或位置搜索"
          value={keyword}
          onInput={e => { setKeyword(e.detail.value); setHighlightId(null); setScanResult(null); }}
          onConfirm={handleSearchByCode}
          confirmType="search"
        />
        <View className={styles.searchAction} onClick={handleSearchByCode}>
          <Text className={styles.searchActionText}>搜索</Text>
        </View>
      </View>

      <View className={styles.scanBtn} onClick={handleScan}>
        <Text className={styles.scanIcon}>📷</Text>
        <Text className={styles.scanText}>扫码查询器材</Text>
      </View>

      {typeof scanResult === 'string' && scanResult.startsWith('未找到') && (
        <View className={styles.scanError}>
          <Text className={styles.scanErrorIcon}>❌</Text>
          <Text className={styles.scanErrorText}>{scanResult}</Text>
          <View className={styles.errorClose} onClick={() => setScanResult(null)}>
            <Text className={styles.errorCloseText}>✕</Text>
          </View>
        </View>
      )}

      <ScrollView
        className={styles.typeFilterWrap}
        scrollX
        enhanced
        showScrollbar={false}
      >
        <View className={styles.typeFilter}>
          {typeOptions.map(type => (
            <View
              key={type}
              className={classnames(styles.typeBtn, activeType === type && styles.typeBtnActive)}
              onClick={() => { setActiveType(type); setHighlightId(null); }}
            >
              <Text className={classnames(styles.typeBtnText, activeType === type && styles.typeBtnTextActive)}>
                {type}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        ref={scrollRef}
        className={styles.equipList}
        scrollY
        enhanced
      >
        {filteredList.length > 0 ? (
          filteredList.map(item => {
            const isExpired = new Date(item.expireDate) < new Date();
            const isExpanded = expandedId === item.id;
            return (
              <View
                key={item.id}
                id={`equip-${item.id}`}
                className={classnames(
                  styles.equipCard,
                  highlightId === item.id && styles.equipCardHighlight
                )}
                onClick={() => handleCardClick(item.id)}
              >
                <View className={styles.equipTop}>
                  <Image className={styles.equipImage} src={item.imageUrl} mode="aspectFill" />
                  <View className={styles.equipInfo}>
                    <Text className={styles.equipName}>{item.name}</Text>
                    <Text className={styles.equipType}>类型：{item.type}</Text>
                    <Text className={styles.equipLocation}>📍 {item.floor} · {item.location}</Text>
                    <Text className={styles.equipCode}>编号：{item.qrCode} / {item.position}</Text>
                  </View>
                </View>
                <View className={styles.equipDetail}>
                  <View className={styles.detailItem}>
                    <Text className={styles.detailLabel}>有效期至</Text>
                    <Text className={classnames(styles.detailValue, isExpired && styles.expireValue)}>
                      {item.expireDate}
                      {isExpired && <Text className={styles.expireBadge}> 已过期</Text>}
                    </Text>
                  </View>
                  <View className={styles.detailItem}>
                    <Text className={styles.detailLabel}>最近检查</Text>
                    <Text className={styles.detailValue}>{item.lastCheckDate}</Text>
                  </View>
                  <View className={styles.detailItem}>
                    <Text className={styles.detailLabel}>检查结果</Text>
                    <Text className={classnames(
                      styles.detailValue,
                      item.lastCheckResult === 'normal' ? styles.checkResultNormal : styles.checkResultAbnormal
                    )}>
                      ● {item.lastCheckResult === 'normal' ? '正常' : '异常'}
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View className={styles.expandedSection}>
                    <View className={styles.expandedTitle}>
                      <Text className={styles.expandedTitleText}>检查记录详情</Text>
                    </View>
                    <View className={styles.expandedRow}>
                      <Text className={styles.expandedLabel}>设备编号</Text>
                      <Text className={styles.expandedValue}>{item.qrCode}</Text>
                    </View>
                    <View className={styles.expandedRow}>
                      <Text className={styles.expandedLabel}>安装位置</Text>
                      <Text className={styles.expandedValue}>{item.floor} {item.location} {item.position}</Text>
                    </View>
                    <View className={styles.expandedRow}>
                      <Text className={styles.expandedLabel}>有效期</Text>
                      <Text className={classnames(styles.expandedValue, isExpired && styles.expireValue)}>
                        {item.expireDate} {isExpired ? '(已过期)' : ''}
                      </Text>
                    </View>
                    <View className={styles.expandedRow}>
                      <Text className={styles.expandedLabel}>最近检查</Text>
                      <Text className={styles.expandedValue}>{item.lastCheckDate}</Text>
                    </View>
                    <View className={styles.expandedRow}>
                      <Text className={styles.expandedLabel}>检查结果</Text>
                      <Text className={classnames(
                        styles.expandedValue,
                        item.lastCheckResult === 'normal' ? styles.checkResultNormal : styles.checkResultAbnormal
                      )}>
                        {item.lastCheckResult === 'normal' ? '✅ 正常' : '⚠️ 异常'}
                      </Text>
                    </View>
                    <View className={styles.expandedRow}>
                      <Text className={styles.expandedLabel}>设备状态</Text>
                      <Text className={classnames(
                        styles.expandedValue,
                        isExpired ? styles.checkResultAbnormal : styles.checkResultNormal
                      )}>
                        {isExpired ? '⚠️ 已过期需更换' : '✅ 在有效期内'}
                      </Text>
                    </View>
                  </View>
                )}

                {highlightId === item.id && (
                  <View className={styles.scanBadge}>
                    <Text className={styles.scanBadgeText}>
                      {isExpanded ? '查看详情' : '扫码定位'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🧯</Text>
            <Text className={styles.emptyText}>未找到相关器材</Text>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

export default EquipmentPage;
