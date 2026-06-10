import React, { useState } from 'react';
import { View, Text, Image, Textarea, Input } from '@tarojs/components';
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
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [reconCause, setReconCause] = useState('');
  const [reconImage, setReconImage] = useState('');
  const [reconReviewer, setReconReviewer] = useState('');
  const [reconNote, setReconNote] = useState('');

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

  const handleChooseNoteImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setNoteImage(res.tempFilePaths[0]);
      }
    });
  };

  const handleChooseReconImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setReconImage(res.tempFilePaths[0]);
      }
    });
  };

  const handleCloseClick = () => {
    if (hazard.status === 'rectified' || hazard.status === 'closed') {
      setReconReviewer(hazard.inspector || '当前巡检员');
      setShowCloseModal(true);
      return;
    }
    Taro.showModal({
      title: '确认关闭',
      content: '建议先完成整改和复查再关闭。确认直接关闭？',
      success: (res) => {
        if (res.confirm) {
          setReconReviewer(hazard.inspector || '当前巡检员');
          setShowCloseModal(true);
        }
      }
    });
  };

  const handleSubmitClose = () => {
    if (!reconCause.trim()) {
      Taro.showToast({ title: '请填写最终原因', icon: 'none' });
      return;
    }
    if (!reconReviewer.trim()) {
      Taro.showToast({ title: '请填写复查人', icon: 'none' });
      return;
    }
    if (!reconNote.trim()) {
      Taro.showToast({ title: '请填写关闭说明', icon: 'none' });
      return;
    }
    closeHazard(id, {
      finalCause: reconCause,
      rectifyImageUrl: reconImage || undefined,
      reviewer: reconReviewer,
      closeNote: reconNote,
    });
    setHazard(getHazardById(id));
    setShowCloseModal(false);
    setReconCause('');
    setReconImage('');
    setReconReviewer('');
    setReconNote('');
    Taro.showToast({ title: '已关闭，待办已同步', icon: 'success' });
  };

  const handleCancelClose = () => {
    setShowCloseModal(false);
    setReconCause('');
    setReconImage('');
    setReconReviewer('');
    setReconNote('');
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
            <View className={styles.sourceInfo} onClick={() => {
              if (hazard.sourceRouteId) {
                Taro.navigateTo({ url: `/pages/inspect/check/index?id=${hazard.sourceRouteId}` });
              }
            }}>
              <Text className={styles.sourceLabel}>巡检来源（点击查看）</Text>
              <Text className={styles.sourceValue}>
                路线「{hazard.sourceRouteName || hazard.sourceRouteId}」· 点位「{hazard.sourcePointName}」
              </Text>
            </View>
          )}
          <Text className={styles.descTitle}>隐患描述</Text>
          <Text className={styles.descText}>{hazard.description}</Text>
        </View>

        {hazard.closeReconciliation && (
          <View className={styles.reconCard}>
            <Text className={styles.reconTitle}>闭环复盘信息</Text>
            <View className={styles.reconItem}>
              <Text className={styles.reconLabel}>最终原因</Text>
              <Text className={styles.reconValue}>{hazard.closeReconciliation.finalCause}</Text>
            </View>
            {hazard.closeReconciliation.rectifyImageUrl && (
              <View className={styles.reconItem}>
                <Text className={styles.reconLabel}>整改照片</Text>
                <Image
                  className={styles.reconImage}
                  src={hazard.closeReconciliation.rectifyImageUrl}
                  mode="aspectFill"
                />
              </View>
            )}
            <View className={styles.reconItem}>
              <Text className={styles.reconLabel}>复查人</Text>
              <Text className={styles.reconValue}>{hazard.closeReconciliation.reviewer}</Text>
            </View>
            <View className={styles.reconItem}>
              <Text className={styles.reconLabel}>关闭说明</Text>
              <Text className={styles.reconValue}>{hazard.closeReconciliation.closeNote}</Text>
            </View>
          </View>
        )}

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
            <View className={styles.noteImageRow} onClick={handleChooseNoteImage}>
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

      {showCloseModal && (
        <View className={styles.closeModal}>
          <View className={styles.closeContent}>
            <Text className={styles.closeTitle}>关闭隐患复盘</Text>
            <Text className={styles.closeSubtitle}>请填写以下复盘信息，关闭后相关待办消息会自动消除</Text>

            <View className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>最终原因 <Text className={styles.required}>*</Text></Text>
              <Textarea
                className={styles.fieldTextarea}
                placeholder="请描述隐患产生的根本原因"
                value={reconCause}
                onInput={e => setReconCause(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>整改照片（可选）</Text>
              <View className={styles.imageRow} onClick={handleChooseReconImage}>
                {reconImage ? (
                  <Image className={styles.reconImagePreview} src={reconImage} mode="aspectFill" />
                ) : (
                  <View className={styles.addImageBtn}>
                    <Text className={styles.addImageText}>+ 拍照/选图</Text>
                  </View>
                )}
              </View>
            </View>

            <View className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>复查人 <Text className={styles.required}>*</Text></Text>
              <Input
                className={styles.fieldInput}
                placeholder="请输入复查人姓名"
                value={reconReviewer}
                onInput={e => setReconReviewer(e.detail.value)}
                maxlength={20}
              />
            </View>

            <View className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>关闭说明 <Text className={styles.required}>*</Text></Text>
              <Textarea
                className={styles.fieldTextarea}
                placeholder="请填写关闭说明和后续措施"
                value={reconNote}
                onInput={e => setReconNote(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.closeBtns}>
              <View className={styles.closeCancelBtn} onClick={handleCancelClose}>
                <Text className={styles.closeCancelText}>取消</Text>
              </View>
              <View className={styles.closeSubmitBtn} onClick={handleSubmitClose}>
                <Text className={styles.closeSubmitText}>确认关闭</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {hazard.status !== 'closed' && !showAddNote && !showCloseModal && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(styles.actionBtn, styles.actionBtnSecondary)}
            onClick={handleCloseClick}
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
