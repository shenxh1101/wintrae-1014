import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { MessageType } from '@/types';
import { useAppStore } from '@/store';
import MessageItem from '@/components/MessageItem';
import classnames from 'classnames';
import styles from './index.module.scss';

const typeFilters: { key: MessageType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'overdue', label: '逾期' },
  { key: 'repeat', label: '重复' },
  { key: 'high_risk', label: '高风险' },
  { key: 'rectify', label: '整改' },
  { key: 'training', label: '培训' },
  { key: 'system', label: '系统' }
];

const MessagePage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<MessageType | 'all'>('all');
  const messages = useAppStore(s => s.messages);
  const markAllMessagesRead = useAppStore(s => s.markAllMessagesRead);
  const checkOverdue = useAppStore(s => s.checkOverdue);

  useDidShow(() => {
    useAppStore.getState();
    checkOverdue();
  });

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return messages;
    return messages.filter(m => m.type === activeFilter);
  }, [activeFilter, messages]);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <View className={styles.container}>
      <View className={styles.filterBar}>
        {typeFilters.map(f => (
          <View
            key={f.key}
            className={classnames(styles.filterBtn, activeFilter === f.key && styles.filterBtnActive)}
            onClick={() => setActiveFilter(f.key)}
          >
            <Text className={classnames(styles.filterText, activeFilter === f.key && styles.filterTextActive)}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      {unreadCount > 0 && (
        <View className={styles.markAll} onClick={markAllMessagesRead}>
          <Text className={styles.markAllText}>全部标为已读（{unreadCount}条未读）</Text>
        </View>
      )}

      <View className={styles.list}>
        {filteredList.length > 0 ? (
          filteredList.map(item => <MessageItem key={item.id} data={item} />)
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无消息</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MessagePage;
