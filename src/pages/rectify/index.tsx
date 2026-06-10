import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { hazardList, hazardTypeMap, hazardLevelMap } from '@/data/hazard';
import StatusTag from '@/components/StatusTag';
import classnames from 'classnames';
import styles from './index.module.scss';

const RectifyPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || 'HZ001';
  const hazard = hazardList.find(h => h.id === id) || hazardList[0];

  const [requirement, setRequirement] = useState(hazard.rectifyRequirement || '');
  const [deadline, setDeadline] = useState(hazard.deadline || '');
  const [reviewResult, setReviewResult] = useState<'pass' | 'fail' | ''>('');
  const [reviewNote, setReviewNote] = useState('');

  const handleSubmit = () => {
    if (!requirement.trim()) {
      Taro.showToast({ title: '请填写整改要求', icon: 'none' });
      return;
    }
    if (!deadline.trim()) {
      Taro.showToast({ title: '请填写整改期限', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

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
        <Text className={styles.formTitle}>整改要求</Text>
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
          <Text className={styles.formLabel}>整改期限 <Text className={styles.formRequired}>*</Text></Text>
          <Input
            className={styles.formInput}
            placeholder="例如：2026-06-15"
            value={deadline}
            onInput={e => setDeadline(e.detail.value)}
          />
        </View>
      </View>

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

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitText}>提交整改</Text>
        </View>
      </View>
    </View>
  );
};

export default RectifyPage;
