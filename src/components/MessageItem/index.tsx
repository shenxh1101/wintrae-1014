import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MessageItem as MessageItemType } from '@/types';
import { messageTypeMap } from '@/data/message';
import { useAppStore } from '@/store';
import classnames from 'classnames';
import styles from './index.module.scss';

interface MessageItemProps {
  data: MessageItemType;
}

const priorityIconMap: Record<string, string> = {
  urgent: '🔴',
  important: '🟠',
  normal: '🔵'
};

const MessageItem: React.FC<MessageItemProps> = ({ data }) => {
  const markMessageRead = useAppStore(s => s.markMessageRead);

  const handleClick = () => {
    if (!data.read) {
      markMessageRead(data.id);
    }

    if (data.relatedId) {
      if (data.relatedType === 'hazard' || data.relatedId.startsWith('HZ')) {
        Taro.navigateTo({ url: `/pages/hazard/detail/index?id=${data.relatedId}` });
      } else if (data.relatedType === 'equipment' || data.relatedId.startsWith('EQ')) {
        Taro.navigateTo({ url: `/pages/equipment/index?highlightId=${data.relatedId}` });
      }
    }
  };

  return (
    <View
      className={classnames(styles.item, !data.read && styles.itemUnread)}
      onClick={handleClick}
    >
      <View className={styles.icon}>
        <Text className={styles.iconText}>{priorityIconMap[data.priority]}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={classnames(styles.title, !data.read && styles.titleUnread)}>
            {data.title}
          </Text>
          <View className={classnames(styles.typeTag, styles[`type${data.type.charAt(0).toUpperCase()}${data.type.slice(1)}`])}>
            <Text className={styles.typeText}>{messageTypeMap[data.type]}</Text>
          </View>
        </View>
        <Text className={styles.desc}>{data.content}</Text>
        <View className={styles.bottomRow}>
          <Text className={styles.time}>{data.time}</Text>
          {data.relatedId && !data.read && (
            <Text className={styles.actionHint}>点击查看 &gt;</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default MessageItem;
