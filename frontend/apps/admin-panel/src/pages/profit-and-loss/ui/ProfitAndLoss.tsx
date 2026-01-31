import { useProfitAndLoss } from '../hooks/useProfitAndLoss'
import * as Styled from './styled'

export const ProfitAndLoss = () => {
    const { isLoading } = useProfitAndLoss()

    if (isLoading) {
        return (
            <Styled.PageContainer>
                <Styled.LoadingContainer>Загрузка отчёта P&L...</Styled.LoadingContainer>
            </Styled.PageContainer>
        )
    }

    return (
        <Styled.PageContainer>
            <Styled.Header>
                <Styled.HeaderLeft>
                    <Styled.BackButton onClick={() => { }}>←</Styled.BackButton>
                    <Styled.Title>P&L (Отчёт о прибылях и убытках)</Styled.Title>
                </Styled.HeaderLeft>
                <Styled.HeaderActions>
                    <Styled.ActionButton>
                        <span>📅</span>
                        Период
                    </Styled.ActionButton>
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

            <Styled.ContentContainer>
                <Styled.Section>
                    <Styled.SectionTitle>Доходы</Styled.SectionTitle>
                    <Styled.DataRow>
                        <Styled.DataLabel>Выручка</Styled.DataLabel>
                        <Styled.DataValue type="positive">0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                    <Styled.DataRow>
                        <Styled.DataLabel>Прочие доходы</Styled.DataLabel>
                        <Styled.DataValue type="positive">0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                    <Styled.DataRow>
                        <Styled.DataLabel bold>Всего доходов</Styled.DataLabel>
                        <Styled.DataValue type="positive" bold>0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                </Styled.Section>

                <Styled.Section>
                    <Styled.SectionTitle>Расходы</Styled.SectionTitle>
                    <Styled.DataRow>
                        <Styled.DataLabel>Себестоимость товаров</Styled.DataLabel>
                        <Styled.DataValue type="negative">0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                    <Styled.DataRow>
                        <Styled.DataLabel>Зарплата</Styled.DataLabel>
                        <Styled.DataValue type="negative">0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                    <Styled.DataRow>
                        <Styled.DataLabel>Аренда</Styled.DataLabel>
                        <Styled.DataValue type="negative">0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                    <Styled.DataRow>
                        <Styled.DataLabel>Прочие расходы</Styled.DataLabel>
                        <Styled.DataValue type="negative">0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                    <Styled.DataRow>
                        <Styled.DataLabel bold>Всего расходов</Styled.DataLabel>
                        <Styled.DataValue type="negative" bold>0 ₽</Styled.DataValue>
                    </Styled.DataRow>
                </Styled.Section>

                <Styled.SummarySection>
                    <Styled.SummaryLabel>Чистая прибыль</Styled.SummaryLabel>
                    <Styled.SummaryValue>0 ₽</Styled.SummaryValue>
                </Styled.SummarySection>
            </Styled.ContentContainer>
        </Styled.PageContainer>
    )
}
