import React, { useState } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { hazardTypeMap, hazardLevelMap } from '@/data/hazard';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import classnames from 'classnames';
import styles from './index.module.scss';

const RectifyPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || 'HZ001';
  const getHazardById = useAppStore(s => s.getHazardById);
  const updateHazardRectify = useAppStore(s => s.updateHazardRectify);
  const addTimelineEntry = useAppStore(s => s.addTimelineEntry);

  const [hazard, setHazard] = useState(() => getHazardById(id));
  const [requirement, setRequirement] = useState(hazard?.rectifyRequirement || '');
  const [deadline, setDeadline] = useState(hazard?.deadline || '');
  const [inspector, setInspector] = useState(hazard?.inspector || '');
  const [reviewResult, setReviewResult] = useState<'pass' | 'fail' | ''>('');
  const [reviewNote, setReviewNote] = useState('');
  const [supplementRemark, setSupplementRemark] = useState('');
  const [supplementImage, setSupplementImage] = useState('');

  useDidShow(() => {
    const h = getHazardById(id);
    if (h) {
      setHazard(h);
      setRequirement(h.rectifyRequirement || '');
      setDeadline(h.deadline || '');
      setInspector(h.inspector || '');
    }
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

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setSupplementImage(res.tempFilePaths[0]);
      }
    });
  };

  const handleSubmit = () => {
    if (hazard.status === 'pending') {
      if (!requirement.trim()) {
        Taro.showToast({ title: '请填写整改要求', icon: 'none' });
        return;
      }
      if (!deadline.trim()) {
        Taro.showToast({ title: '请填写整改期限', icon: 'none' });
        return;
      }
      updateHazardRectify(id, {
        rectifyRequirement: requirement,
        deadline,
        inspector: inspector || '当前巡检员',
      });
      if (supplementRemark.trim() || supplementImage) {
        addTimelineEntry(id, {
          action: '整改补充',
          operator: inspector || '当前巡检员',
          remark: supplementRemark,
          imageUrl: supplementImage || undefined,
        });
      }
      Taro.showToast({ title: '整改已提交', icon: 'success' });
    } else if (hazard.status === 'processing') {
      if (!reviewResult) {
        Taro.showToast({ title: '请选择复查结果', icon: 'none' });
        return;
      }
      updateHazardRectify(id, {
        rectifyRequirement: requirement,
        deadline,
        inspector,
        reviewResult,
        reviewNote,
      });
      if (supplementRemark.trim() || supplementImage) {
        addTimelineEntry(id, {
          action: '复查补充',
          operator: '复查人员',
          remark: supplementRemark,
          imageUrl: supplementImage || undefined,
        });
      }
      Taro.showToast({ title: reviewResult === 'pass' ? '复查合格' : '需重新整改', icon: 'success' });
    }

    setTimeout(() => {
      Taro.navigateBack();
    }, 1200);
  };

  const isReviewMode = hazard.status === 'processing';

  return (
    <View className={styles.container}>
      <View className={styles.hazardInfo}>
        <Text className={styles.hazardTitle}>{hazard.title}</Text>
        <View className={styles.hazardMeta}>
          <Text className={styles.metaItem}>{hazardTypeMap[hazard.type]}</Text>
          <StatusTag status={hazard.level} statusMap={hazardLevelMap} />
          <Text className={styles.metaItem}>{hazard.floor} · {hazard.location}</Text>
        </View>
        <Text className={styles.hazardDesc}>{hazard.description}</Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.formTitle}>
          {isReviewMode ? '整改要求（可修改）' : '整改要求'}
        </Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>整改要求 <Text className={styles.formRequired}>*</Text></Text>
          <Textarea
            className={styles.formTextArea}
            placeholder="请详细描述整改要求"
            value={requirement}
            onInput={e => setRequirement(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>整改负责人</Text>
          <Input
            className={styles.formInput}
            placeholder="如：张巡检"
            value={inspector}
            onInput={e => setInspector(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>整改期限 <Text className={styles.formRequired}>*</Text></Text>
          <Input
            className={styles.formInput}
            placeholder="例如：2026-06-15"
            value={deadline}
            onInput={e => setDeadline(e.detail.value)}
          />
        </View>
      </View>

      {isReviewMode && (
        <View className={styles.formSection}>
          <Text className={styles.formTitle}>复查结论</Text>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>复查结果</Text>
            <View className={styles.resultOptions}>
              <View
                className={classnames(styles.resultOption, styles.resultPass, reviewResult === 'pass' && styles.resultOptionActive)}
                onClick={() => setReviewResult('pass')}
              >
                <Text className={classnames(styles.resultText, styles.resultTextPass)}>合格</Text>
              </View>
              <View
                className={classnames(styles.resultOption, styles.resultFail, reviewResult === 'fail' && styles.resultOptionActive)}
                onClick={() => setReviewResult('fail')}
              >
                <Text className={classnames(styles.resultText, styles.resultTextFail)}>不合格</Text>
              </View>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>复查备注</Text>
            <Textarea
              className={styles.formTextArea}
              placeholder="请填写复查备注说明"
              value={reviewNote}
              onInput={e => setReviewNote(e.detail.value)}
            />
          </View>
        </View>
      )}

      <View className={styles.formSection}>
        <Text className={styles.formTitle}>补充信息（可选）</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>补充备注</Text>
          <Textarea
            className={styles.formTextArea}
            placeholder="补充备注、现场说明等"
            value={supplementRemark}
            onInput={e => setSupplementRemark(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>补充照片</Text>
          <View className={styles.imageRow} onClick={handleChooseImage}>
            {supplementImage ? (
              <Image className={styles.supplementPreview} src={supplementImage} mode="aspectFill" />
            ) : (
              <View className={styles.addImageBtn}>
                <Text className={styles.addImageText}>+ 拍照/选图</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitText}>
            {isReviewMode ? '提交复查结论' : '提交整改要求'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RectifyPage;
