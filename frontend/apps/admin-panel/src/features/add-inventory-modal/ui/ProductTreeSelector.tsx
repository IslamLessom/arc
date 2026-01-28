import { useState, useEffect } from 'react'
import type { ProductTreeNode } from '../model/types'
import * as Styled from './styled'

interface ProductTreeSelectorProps {
  tree: ProductTreeNode[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onNodeToggle: (nodeId: string) => void
  onNodeCheck: (nodeId: string, checked: boolean) => void
}

export const ProductTreeSelector = ({
  tree,
  searchQuery,
  onSearchChange,
  onNodeToggle,
  onNodeCheck,
}: ProductTreeSelectorProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    onSearchChange(value)
  }

  // Count selected items
  const countSelectedItems = (nodes: ProductTreeNode[]): { ingredients: number; products: number } => {
    let ingredients = 0
    let products = 0

    nodes.forEach((node) => {
      if (node.type === 'ingredients') {
        const items = collectAllItems(node)
        ingredients += items.filter((i) => i.checked).length
      } else if (node.type === 'products') {
        const items = collectAllItems(node)
        products += items.filter((i) => i.checked).length
      } else if (node.children) {
        const counts = countSelectedItems(node.children)
        ingredients += counts.ingredients
        products += counts.products
      }
    })

    return { ingredients, products }
  }

  const collectAllItems = (node: ProductTreeNode): ProductTreeNode[] => {
    if (node.type === 'item') {
      return [node]
    }
    if (node.children) {
      return node.children.flatMap(collectAllItems)
    }
    return []
  }

  const selectedCounts = countSelectedItems(tree)

  const renderNode = (node: ProductTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0

    let countText = ''
    if (node.type !== 'item') {
      if ((node.count ?? 0) === 0) {
        countText = 'Нет продуктов'
      } else if (node.children && node.children.length > 0) {
        // Category with subcategories
        const totalItems = node.children.reduce((sum, child) => {
          if (child.type === 'item') return sum + 1
          if (child.children) return sum + child.children.filter((c) => c.type === 'item').length
          return sum
        }, 0)
        const subCount = node.children.length
        countText = `${subCount} подкатегор${getCategorySuffix(subCount)}, ${totalItems} продукт${getProductSuffix(totalItems)}`
      } else {
        // Category with items directly
        const itemCount = node.count ?? 0
        countText = `${itemCount} продукт${getProductSuffix(itemCount)}`
      }
    }

    return (
      <Styled.TreeNode key={node.id} $level={level}>
        <Styled.TreeNodeHeader>
          <Styled.TreeNodeCheckbox
            type="checkbox"
            checked={node.checked}
            onChange={(e) => onNodeCheck(node.id, e.target.checked)}
          />
          <Styled.TreeNodeToggle
            type="button"
            onClick={() => onNodeToggle(node.id)}
            $hasChildren={!!hasChildren}
            $expanded={!!node.expanded}
          >
            {hasChildren ? (node.expanded ? '▼' : '▶') : ''}
          </Styled.TreeNodeToggle>
          <Styled.TreeNodeLabel>
            {node.name}
            {countText && (
              <Styled.TreeNodeCount> {countText}</Styled.TreeNodeCount>
            )}
          </Styled.TreeNodeLabel>
        </Styled.TreeNodeHeader>
        {hasChildren && node.expanded && (
          <Styled.TreeNodeChildren>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </Styled.TreeNodeChildren>
        )}
      </Styled.TreeNode>
    )
  }

  const getCategorySuffix = (count: number): string => {
    const lastTwo = count % 100
    const lastOne = count % 10

    if (lastTwo >= 11 && lastTwo <= 19) {
      return 'ий'
    }
    if (lastOne === 1) {
      return 'ия'
    }
    if (lastOne >= 2 && lastOne <= 4) {
      return 'ии'
    }
    return 'ий'
  }

  const getProductSuffix = (count: number): string => {
    if (count === 0) return 'ов'
    const lastTwo = count % 100
    const lastOne = count % 10

    if (lastTwo >= 11 && lastTwo <= 19) {
      return 'ов'
    }
    if (lastOne === 1) {
      return ''
    }
    if (lastOne >= 2 && lastOne <= 4) {
      return 'а'
    }
    return 'ов'
  }

  const getSelectedText = () => {
    const parts = []
    if (selectedCounts.ingredients > 0) {
      const suffix =
        selectedCounts.ingredients % 10 === 1 && selectedCounts.ingredients % 100 !== 11
          ? 'а'
          : selectedCounts.ingredients % 10 >= 2 &&
              selectedCounts.ingredients % 10 <= 4 &&
              (selectedCounts.ingredients % 100 < 10 || selectedCounts.ingredients % 100 >= 20)
            ? 'ы'
            : ''
      parts.push(`${selectedCounts.ingredients} ингредиент${suffix}`)
    }
    if (selectedCounts.products > 0) {
      const suffix =
        selectedCounts.products % 10 === 1 && selectedCounts.products % 100 !== 11 ? '' : 'а'
      parts.push(`${selectedCounts.products} товар${suffix}`)
    }
    if (parts.length === 0) return 'Выберите продукты или категории, чтобы проверить их остаток на складе'
    return `Выбрано: ${parts.join(', ')}`
  }

  return (
    <Styled.ProductTreeContainer>
      <Styled.TreeHeader>
        <Styled.TreeTitle>
          {getSelectedText()}
          <Styled.TreeInfoIcon title="Выберите продукты или категории, чтобы проверить их остаток на складе">
            ?
          </Styled.TreeInfoIcon>
        </Styled.TreeTitle>
      </Styled.TreeHeader>

      <Styled.TreeSearchContainer>
        <Styled.TreeSearchInput
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="Быстрый поиск"
        />
      </Styled.TreeSearchContainer>

      <Styled.TreeContent>
        {tree.length > 0 ? (
          tree.map((node) => renderNode(node))
        ) : (
          <Styled.TreeEmptyState>
            Нет доступных продуктов. Выберите склад для загрузки данных.
          </Styled.TreeEmptyState>
        )}
      </Styled.TreeContent>
    </Styled.ProductTreeContainer>
  )
}
