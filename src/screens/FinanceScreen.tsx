import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFinanceStore, useBankStore, useCreditCardStore } from '@/store';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Modal } from '@/components/common/Modal';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';
import { BankTransaction } from '@/models/BankAccount';
import { Expense } from '@/models/Finance';
import { computeCreditCardFields } from '@/models/CreditCard';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

export function FinanceScreen() {
  const { budget, expenses, addExpense, togglePrivacyMode, removeExpense } = useFinanceStore();
  const { accounts, transactions: bankTxs, addTransaction: addBankTx, updateBalance } = useBankStore();
  const { card, addPurchase } = useCreditCardStore();

  const [modalType, setModalType] = useState<'income'|'expense'|'transfer'|null>(null);
  
  // Forms
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<any>('miscellaneous');
  const [accId, setAccId] = useState(accounts.find(a => a.purpose === 'daily_use')?.id || accounts[0]?.id || '');
  const [toAccId, setToAccId] = useState(accounts.find(a => a.purpose === 'savings')?.id || accounts[1]?.id || '');

  // Derivations
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const monthStr = todayStr.substring(0, 7);
  const nowStr = new Date().toISOString();

  const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));
  const todayExpensesList = expenses.filter(e => e.date === todayStr);

  const monthSpent = monthExpenses.reduce((acc, e) => acc + e.amountINR, 0);
  const todaySpent = todayExpensesList.reduce((acc, e) => acc + e.amountINR, 0);
  
  const fixedAllocated = budget.rentINR + budget.gymINR + budget.gymFoodINR + budget.sipINR;
  const monthRemaining = budget.monthlyIncomeINR - fixedAllocated; 
  const privacyMode = budget.privacyModeEnabled;

  const { personalCeilingINR, availableINR } = card ? computeCreditCardFields(card) : { personalCeilingINR: 540, availableINR: 1800 };

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;
    const num = Number(amount);
    const sourceAcc = accounts.find(a => a.id === accId);
    
    if (modalType === 'income') {
      if (sourceAcc) {
        await addBankTx({
          id: generateId(),
          bankAccountId: accId,
          amountINR: num,
          type: 'credit',
          category: 'salary',
          description: desc || 'Income',
          date: todayStr,
          timestamp: nowStr,
          balanceAfterINR: sourceAcc.balanceINR + num
        });
      }
    } else if (modalType === 'expense') {
      const expenseId = generateId();
      await addExpense({
        id: expenseId,
        amountINR: num,
        category,
        date: todayStr,
        timestamp: nowStr,
        note: desc,
        isRecurring: false,
        bankAccountId: accId !== 'cc' ? accId : undefined,
        creditCardId: accId === 'cc' ? card?.id : undefined
      });
      
      if (accId === 'cc' && card) {
        await addPurchase({
          id: generateId(),
          creditCardId: card.id,
          amountINR: num,
          type: 'purchase',
          category: category as any,
          description: desc || 'Expense',
          date: todayStr,
          timestamp: nowStr
        });
      } else if (sourceAcc) {
        await addBankTx({
          id: generateId(),
          bankAccountId: accId,
          amountINR: num,
          type: 'debit',
          category: category as any,
          description: desc || 'Expense',
          date: todayStr,
          timestamp: nowStr,
          balanceAfterINR: sourceAcc.balanceINR - num
        });
      }
    } else if (modalType === 'transfer') {
      const destAcc = accounts.find(a => a.id === toAccId);
      if (sourceAcc && destAcc && sourceAcc.id !== destAcc.id) {
        // Debit source
        await addBankTx({
          id: generateId(),
          bankAccountId: sourceAcc.id,
          amountINR: num,
          type: 'debit',
          category: 'transfer',
          description: `To ${destAcc.displayBankName}`,
          date: todayStr,
          timestamp: nowStr,
          balanceAfterINR: sourceAcc.balanceINR - num
        });
        // Credit dest
        await addBankTx({
          id: generateId(),
          bankAccountId: destAcc.id,
          amountINR: num,
          type: 'credit',
          category: 'transfer',
          description: `From ${sourceAcc.displayBankName}`,
          date: todayStr,
          timestamp: nowStr,
          balanceAfterINR: destAcc.balanceINR + num
        });
      }
    }
    
    setModalType(null);
    setAmount('');
    setDesc('');
  };

  const renderPrivacy = (val: string | number) => {
    if (privacyMode) return '••••••';
    return `₹${val.toLocaleString()}`;
  };

  const sbiAcc = accounts.find(a => a.bankName === 'sbi');
  const unionAcc = accounts.find(a => a.bankName === 'union_bank');
  const kotakAcc = accounts.find(a => a.purpose === 'savings' || a.bankName === 'kotak');

  const combinedTxs = [
    ...expenses.map(e => ({ id: e.id, desc: e.note || e.category, amount: e.amountINR, type: 'expense', date: e.date, timestamp: e.timestamp, category: e.category })),
    ...bankTxs.filter(t => t.type === 'credit').map(t => ({ id: t.id, desc: t.description, amount: t.amountINR, type: 'income', date: t.date, timestamp: t.timestamp, category: t.category }))
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const dailyLimit = budget.dailySpendingLimitINR || 500;

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>FINANCE</Text>
          <Text style={styles.headerSubtitle}>Money Command Center</Text>
        </View>
        <TouchableOpacity onPress={togglePrivacyMode}>
          <MaterialCommunityIcons name={privacyMode ? 'eye-off' : 'eye'} size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* QUICK ACTIONS */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => setModalType('expense')}>
            <MaterialCommunityIcons name="arrow-up-circle-outline" size={24} color={Colors.danger} />
            <Text style={styles.quickText}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => setModalType('income')}>
            <MaterialCommunityIcons name="arrow-down-circle-outline" size={24} color={Colors.success} />
            <Text style={styles.quickText}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => setModalType('transfer')}>
            <MaterialCommunityIcons name="swap-horizontal" size={24} color={Colors.primary} />
            <Text style={styles.quickText}>Transfer</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* MONTHLY PLAN */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>MONTHLY PLAN</Text>
          <AppCard style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Income</Text>
            <Text style={styles.heroValue}>{renderPrivacy(budget.monthlyIncomeINR)}</Text>

            <View style={styles.budgetRow}>
              <View style={styles.budgetCol}>
                <Text style={styles.budgetLabel}>Allocated</Text>
                <Text style={[styles.budgetValue, { color: Colors.textMuted }]}>{renderPrivacy(fixedAllocated)}</Text>
              </View>
              <View style={styles.budgetCol}>
                <Text style={styles.budgetLabel}>Spent (Variable)</Text>
                <Text style={[styles.budgetValue, { color: Colors.danger }]}>{renderPrivacy(monthSpent)}</Text>
              </View>
              <View style={styles.budgetCol}>
                <Text style={styles.budgetLabel}>Remaining</Text>
                <Text style={[styles.budgetValue, { color: Colors.success }]}>{renderPrivacy(monthRemaining - monthSpent)}</Text>
              </View>
            </View>
          </AppCard>
        </Animated.View>

        {/* DAILY SPENDING */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S SPENDING</Text>
          <AppCard style={styles.dailyCard}>
            <View style={styles.dailyRow}>
              <View>
                <Text style={styles.dailyLabel}>Spent Today</Text>
                <Text style={[styles.dailyValue, todaySpent > dailyLimit && { color: Colors.danger }]}>
                  {renderPrivacy(todaySpent)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.dailyLabel}>Daily Limit</Text>
                <Text style={styles.dailyValue}>{renderPrivacy(dailyLimit)}</Text>
              </View>
            </View>
            <ProgressBar 
              progress={Math.min(1, todaySpent / dailyLimit)} 
              color={todaySpent > dailyLimit ? Colors.danger : Colors.primary} 
              style={{ marginTop: Spacing.md }} 
            />
            {todaySpent > dailyLimit && (
              <Text style={styles.alertMsg}>Daily limit exceeded.</Text>
            )}
            {(dailyLimit * 30) > monthRemaining && (
              <View style={styles.warningBox}>
                <MaterialCommunityIcons name="alert" size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  ₹{dailyLimit}/day exceeds remaining monthly budget ({renderPrivacy(monthRemaining)}).
                </Text>
              </View>
            )}
          </AppCard>
        </Animated.View>

        {/* ACCOUNTS */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNTS</Text>
          <View style={styles.gridRow}>
            <AppCard style={[styles.accCard, { borderLeftColor: '#0065b3' }]}>
              <Text style={styles.accName}>{sbiAcc?.displayBankName}</Text>
              <Text style={styles.accPurpose}>Daily Use</Text>
              <Text style={styles.accBalance}>{renderPrivacy(sbiAcc?.balanceINR || 0)}</Text>
            </AppCard>
            <AppCard style={[styles.accCard, { borderLeftColor: '#f9a826' }]}>
              <Text style={styles.accName}>{unionAcc?.displayBankName}</Text>
              <Text style={styles.accPurpose}>SIP</Text>
              <Text style={styles.accBalance}>{renderPrivacy(unionAcc?.balanceINR || 0)}</Text>
            </AppCard>
          </View>
          <View style={[styles.gridRow, { marginTop: Spacing.md }]}>
            <AppCard style={[styles.accCard, { borderLeftColor: '#ed1c24' }]}>
              <Text style={styles.accName}>{kotakAcc?.displayBankName || 'Kotak'}</Text>
              <Text style={styles.accPurpose}>Savings</Text>
              <Text style={styles.accBalance}>{renderPrivacy(kotakAcc?.balanceINR || 0)}</Text>
            </AppCard>
            <AppCard style={[styles.accCard, { borderLeftColor: Colors.textSecondary }]}>
              <Text style={styles.accName}>{card?.issuer || 'Credit Card'}</Text>
              <Text style={styles.accPurpose}>Limit: {renderPrivacy(card?.limitINR || 1800)}</Text>
              <Text style={styles.accBalance}>{renderPrivacy(card?.usedINR || 0)}</Text>
              <ProgressBar progress={(card?.usedINR || 0) / personalCeilingINR} color={(card?.usedINR || 0) > personalCeilingINR ? Colors.danger : Colors.primary} style={{ marginTop: Spacing.sm, height: 4 }} />
            </AppCard>
          </View>
        </Animated.View>

        {/* LEDGER */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
          {combinedTxs.slice(0, 10).map((t) => (
            <AppCard key={t.id} style={styles.txCard}>
              <View style={styles.txLeft}>
                <MaterialCommunityIcons 
                  name={t.type === 'income' ? 'arrow-down' : t.type === 'transfer' ? 'swap-horizontal' : 'arrow-up'} 
                  size={20} 
                  color={t.type === 'income' ? Colors.success : t.type === 'transfer' ? Colors.primary : Colors.danger} 
                />
                <View style={styles.txDetails}>
                  <Text style={styles.txDesc}>{t.desc}</Text>
                  <Text style={styles.txMeta}>{t.category} • {t.date}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, { color: t.type === 'income' ? Colors.success : Colors.textPrimary }]}>
                  {t.type === 'income' ? '+' : t.type === 'transfer' ? '' : '-'}
                  {renderPrivacy(t.amount)}
                </Text>
                {t.type === 'expense' && (
                  <TouchableOpacity onPress={() => removeExpense(t.id)}>
                    <MaterialCommunityIcons name="delete-outline" size={16} color={Colors.danger} style={{ marginTop: 4 }} />
                  </TouchableOpacity>
                )}
              </View>
            </AppCard>
          ))}
          {combinedTxs.length === 0 && (
            <Text style={styles.emptyText}>YOUR MONEY SYSTEM STARTS HERE.{"\n"}Add your first expense or income.</Text>
          )}
        </Animated.View>

        {/* STATEMENT VAULT */}
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.section, { paddingBottom: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>STATEMENT VAULT</Text>
          <AppCard style={{ padding: Spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.accName}>Bank Statements</Text>
                <Text style={styles.accPurpose}>Securely track your monthly statements</Text>
              </View>
              <TouchableOpacity>
                <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </AppCard>
        </Animated.View>
        
      </ScrollView>

      <Modal visible={modalType !== null} onClose={() => setModalType(null)} title={modalType === 'income' ? 'Add Income' : modalType === 'transfer' ? 'Transfer' : 'Add Expense'}>
        <View style={styles.form}>
          <Text style={styles.label}>Amount</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0" placeholderTextColor={Colors.textMuted} />
          
          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.input} value={desc} onChangeText={setDesc} placeholder="What was this for?" placeholderTextColor={Colors.textMuted} />
          
          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="food, gym, etc" placeholderTextColor={Colors.textMuted} />
          
          <Text style={styles.label}>Account</Text>
          <View style={styles.row}>
            {accounts.map(a => (
              <TouchableOpacity key={a.id} style={[styles.chip, accId === a.id && styles.chipActive]} onPress={() => setAccId(a.id)}>
                <Text style={[styles.chipText, accId === a.id && styles.chipTextActive]}>{a.displayBankName}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'expense' && card && (
              <TouchableOpacity style={[styles.chip, accId === 'cc' && styles.chipActive]} onPress={() => setAccId('cc')}>
                <Text style={[styles.chipText, accId === 'cc' && styles.chipTextActive]}>Credit Card</Text>
              </TouchableOpacity>
            )}
          </View>

          {modalType === 'transfer' && (
            <>
              <Text style={styles.label}>To Account</Text>
              <View style={styles.row}>
                {accounts.map(a => (
                  <TouchableOpacity key={a.id} style={[styles.chip, toAccId === a.id && styles.chipActive]} onPress={() => setToAccId(a.id)}>
                    <Text style={[styles.chipText, toAccId === a.id && styles.chipTextActive]}>{a.displayBankName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <PrimaryCTA label="Save Transaction" onPress={handleSave} style={{ marginTop: Spacing.xl }} />
        </View>
      </Modal>

    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { ...TextStyles.h1, color: Colors.textPrimary },
  headerSubtitle: { ...TextStyles.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { marginTop: Spacing.xl },
  sectionTitle: { ...TextStyles.overline, color: Colors.textMuted, marginBottom: Spacing.sm, letterSpacing: 1.5, marginLeft: Spacing.sm },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, marginTop: Spacing.md },
  quickBtn: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', gap: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  quickText: { ...TextStyles.caption, color: Colors.textPrimary },
  heroCard: { padding: Spacing.lg, backgroundColor: Colors.surfaceHighlight },
  heroLabel: { ...TextStyles.caption, color: Colors.textSecondary },
  heroValue: { ...TextStyles.h2, color: Colors.textPrimary, marginTop: 4 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  budgetCol: { alignItems: 'flex-start' },
  budgetLabel: { ...TextStyles.tiny, color: Colors.textSecondary },
  budgetValue: { ...TextStyles.h3, marginTop: 4 },
  dailyCard: { padding: Spacing.lg },
  dailyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dailyLabel: { ...TextStyles.caption, color: Colors.textSecondary },
  dailyValue: { ...TextStyles.h2, color: Colors.textPrimary, marginTop: 2 },
  alertMsg: { ...TextStyles.caption, color: Colors.danger, marginTop: Spacing.sm },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: Spacing.sm, borderRadius: Radius.sm, marginTop: Spacing.md, gap: Spacing.sm },
  warningText: { ...TextStyles.tiny, color: '#F59E0B', flex: 1 },
  gridRow: { flexDirection: 'row', gap: Spacing.md },
  accCard: { flex: 1, padding: Spacing.md, borderLeftWidth: 3 },
  accName: { ...TextStyles.label, color: Colors.textPrimary },
  accPurpose: { ...TextStyles.tiny, color: Colors.textSecondary, marginBottom: Spacing.md },
  accBalance: { ...TextStyles.h3, color: Colors.textPrimary },
  txCard: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, marginBottom: Spacing.sm, alignItems: 'center' },
  txLeft: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  txDetails: {},
  txDesc: { ...TextStyles.body, color: Colors.textPrimary },
  txMeta: { ...TextStyles.caption, color: Colors.textMuted },
  txAmount: { ...TextStyles.label, color: Colors.textPrimary },
  emptyText: { ...TextStyles.caption, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 20 },
  form: { paddingBottom: Spacing.xl },
  label: { ...TextStyles.caption, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.md, color: Colors.textPrimary, ...TextStyles.body },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...TextStyles.caption, color: Colors.textSecondary },
  chipTextActive: { color: Colors.background, fontWeight: 'bold' },
});
