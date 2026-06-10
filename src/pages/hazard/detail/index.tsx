import React, { useState } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
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
  const closeHazard = useAppStore(s => s.closeHazard);
  const addTimelineEntry = useAppStore(s => s.addTimelineEntry);
  const [hazard, setHazard] = useState(() => getHazardById(id));
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteImage, setNoteImage] = useState('');

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

  const handleAddNote = () => {
    if (!noteText.trim()) {
      Taro.showToast({ title: '请填写备注', icon: 'none' });
      return;
    }
    addTimelineEntry(id, {
      action: '补充备注',
      operator: '当前用户',
      remark: noteText,
      imageUrl: noteImage || undefined,
    });
    setHazard(getHazardById(id));
    setShowAddNote(false);
    setNoteText('');
    setNoteImage('');
    Taro.showToast({ title: '备注已添加', icon: 'success' });
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setNoteImage(res.tempFilePaths[0]);
      }
    });
  };

  const handleClose = () => {
    Taro.showModal({
      title: '确认关闭',
      content: '关闭后该隐患将标记为已关闭，确认？',
      success: (res) => {
        if (res.confirm) {
          closeHazard(id);
          setHazard(getHazardById(id));
          Taro.showToast({ title: '已关闭', icon: 'success' });
        }
      }
    });
  };

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
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>上报人：</Text>
              <Text className={styles.infoValue}>{hazard.reporter}</Text>
            </View>
          </View>
          {hazard.sourcePointName && (
            <View className={styles.sourceInfo}>
              <Text className={styles.sourceLabel}>巡检来源</Text>
              <Text className={styles.sourceValue}>
                路线「{hazard.sourceRouteName || hazard.sourceRouteId}」· 点位「{hazard.sourcePointName}」
              </Text>
            </View>
          )}
          <Text className={styles.descTitle}>隐患描述</Text>
          <Text className={styles.descText}>{hazard.description}</Text>
        </View>

        <View className={styles.timelineCard}>
          <View className={styles.timelineHeader}>
            <Text className={styles.timelineTitle}>处置台账</Text>
            <View className={styles.addNoteBtn} onClick={() => setShowAddNote(true)}>
              <Text className={styles.addNoteText}>+ 补充备注</Text>
            </View>
          </View>
          <View className={styles.timeline}>
            {hazard.timeline.map((entry, idx) => (
              <View key={entry.id || idx} className={styles.timelineItem}>
                <View className={classnames(styles.timelineDot, idx === hazard.timeline.length - 1 && styles.timelineDotActive)} />
                <View className={styles.timelineContent}>
                  <View className={styles.timelineTop}>
                    <Text className={styles.timelineLabel}>{entry.action}</Text>
                    <Text className={styles.timelineTime}>{entry.time}</Text>
                  </View>
                  <Text className={styles.timelineOperator}>{entry.operator}</Text>
                  {entry.remark && <Text className={styles.timelineDesc}>{entry.remark}</Text>}
                  {entry.imageUrl && <Image className={styles.timelineImage} src={entry.imageUrl} mode="aspectFill" />}
                </View>
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

      {showAddNote && (
        <View className={styles.noteModal}>
          <View className={styles.noteContent}>
            <Text className={styles.noteTitle}>补充备注</Text>
            <View className={styles.noteImageRow} onClick={handleChooseImage}>
              {noteImage ? (
                <Image className={styles.notePreview} src={noteImage} mode="aspectFill" />
              ) : (
                <View className={styles.noteAddImage}>
                  <Text className={styles.noteAddImageText}>+ 拍照/选图</Text>
                </View>
              )}
            </View>
            <Textarea
              className={styles.noteInput}
              placeholder="请输入备注内容"
              value={noteText}
              onInput={e => setNoteText(e.detail.value)}
              maxlength={300}
            />
            <View className={styles.noteBtns}>
              <View className={styles.noteCancelBtn} onClick={() => { setShowAddNote(false); setNoteText(''); setNoteImage(''); }}>
                <Text className={styles.noteCancelText}>取消</Text>
              </View>
              <View className={styles.noteSubmitBtn} onClick={handleAddNote}>
                <Text className={styles.noteSubmitText}>确认添加</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {hazard.status !== 'closed' && !showAddNote && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(styles.actionBtn, styles.actionBtnSecondary)}
            onClick={handleClose}
          >
            <Text className={classnames(styles.actionBtnText, styles.actionBtnTextSecondary)}>关闭隐患</Text>
          </View>
          {(hazard.status === 'pending' || hazard.status === 'processing') && (
            <View
              className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
              onClick={() => Taro.navigateTo({ url: `/pages/rectify/index?id=${hazard.id}` })}
            >
              <Text className={styles.actionBtnText}>
                {hazard.status === 'pending' ? '填写整改' : '复查验收'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default HazardDetailPage;
