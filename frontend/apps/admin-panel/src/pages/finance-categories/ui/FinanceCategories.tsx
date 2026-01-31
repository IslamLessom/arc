import { useFinanceCategories } from '../hooks/useFinanceCategories'
import * as Styled from './styled'

export const FinanceCategories = () => {
    const { isLoading } = useFinanceCategories()

    if (isLoading) {
        return (
            <Styled.PageContainer>
                <Styled.LoadingContainer>Загрузка категорий...</Styled.LoadingContainer>
            </Styled.PageContainer>
        )
    }

    return (
        <Styled.PageContainer>
            <Styled.Header>
                <Styled.HeaderLeft>
                    <Styled.BackButton onClick={() => { }}>←</Styled.BackButton>
                    <Styled.Title>Категории</Styled.Title>
                </Styled.HeaderLeft>
                <Styled.HeaderActions>
                    <Styled.ActionButton>
                        <span>🗑️</span>
                        Корзина
                    </Styled.ActionButton>
                    <Styled.ActionButton>
                        <span>📋</span>
                        Столбцы
                    </Styled.ActionButton>
                    <Styled.ActionButton>
                        <span>📤</span>
                        Экспорт
                    </Styled.ActionButton>
                    <Styled.ActionButton>
                        <span>🖨️</span>
                        Печать
                    </Styled.ActionButton>
                    <Styled.AddButton>Добавить</Styled.AddButton>
                </Styled.HeaderActions>
            </Styled.Header>

            <Styled.SearchContainer>
                <Styled.SearchInputWrapper>
                    <Styled.SearchIcon>🔍</Styled.SearchIcon>
                    <Styled.SearchInput placeholder="Быстрый поиск" />
                </Styled.SearchInputWrapper>
                <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
            </Styled.SearchContainer>

            <Styled.TableContainer>
                <Styled.EmptyState>
                    <Styled.EmptyIcon>🏷️</Styled.EmptyIcon>
                    <Styled.EmptyText>Категории не найдены</Styled.EmptyText>
                    <Styled.EmptySubtext>Нажмите "Добавить" для создания первой категории</Styled.EmptySubtext>
                </Styled.EmptyState>
            </Styled.TableContainer>
        </Styled.PageContainer>
    )
}
