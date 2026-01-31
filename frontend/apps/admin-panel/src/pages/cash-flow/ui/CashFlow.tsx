import { useCashFlow } from '../hooks/useCashFlow'
import * as Styled from './styled'

export const CashFlow = () => {
    const { isLoading } = useCashFlow()

    if (isLoading) {
        return (
            <Styled.PageContainer>
                <Styled.LoadingContainer>Загрузка данных о потоке денег...</Styled.LoadingContainer>
            </Styled.PageContainer>
        )
    }

    return (
        <Styled.PageContainer>
            <Styled.Header>
                <Styled.HeaderLeft>
                    <Styled.BackButton onClick={() => { }}>←</Styled.BackButton>
                    <Styled.Title>Поток денег</Styled.Title>
                </Styled.HeaderLeft>
                <Styled.HeaderActions>
                    <Styled.ActionButton>
                        <span>📤</span>
                        Экспорт
                    </Styled.ActionButton>
                    <Styled.ActionButton>
                        <span>🖨️</span>
                        Печать
                    </Styled.ActionButton>
                </Styled.HeaderActions>
            </Styled.Header>

            <Styled.SearchContainer>
                <Styled.SearchInputWrapper>
                    <Styled.SearchIcon>📅</Styled.SearchIcon>
                    <Styled.SearchInput placeholder="Выберите период" />
                </Styled.SearchInputWrapper>
                <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
            </Styled.SearchContainer>

            <Styled.StatsContainer>
                <Styled.StatCard>
                    <Styled.StatIcon>📥</Styled.StatIcon>
                    <Styled.StatContent>
                        <Styled.StatLabel>Поступления</Styled.StatLabel>
                        <Styled.StatValue>0 ₽</Styled.StatValue>
                    </Styled.StatContent>
                </Styled.StatCard>
                <Styled.StatCard>
                    <Styled.StatIcon>📤</Styled.StatIcon>
                    <Styled.StatContent>
                        <Styled.StatLabel>Расходы</Styled.StatLabel>
                        <Styled.StatValue>0 ₽</Styled.StatValue>
                    </Styled.StatContent>
                </Styled.StatCard>
                <Styled.StatCard>
                    <Styled.StatIcon>💰</Styled.StatIcon>
                    <Styled.StatContent>
                        <Styled.StatLabel>Баланс</Styled.StatLabel>
                        <Styled.StatValue>0 ₽</Styled.StatValue>
                    </Styled.StatContent>
                </Styled.StatCard>
            </Styled.StatsContainer>

            <Styled.TableContainer>
                <Styled.EmptyState>
                    <Styled.EmptyIcon>💵</Styled.EmptyIcon>
                    <Styled.EmptyText>Данные о потоке денег отсутствуют</Styled.EmptyText>
                    <Styled.EmptySubtext>Выберите период для отображения данных</Styled.EmptySubtext>
                </Styled.EmptyState>
            </Styled.TableContainer>
        </Styled.PageContainer>
    )
}
