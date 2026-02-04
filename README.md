<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Configuração do Supabase

Para usar as services que se conectam ao Supabase, você precisa configurar as variáveis de ambiente:

1. Crie um arquivo `.env.local` na raiz do projeto (se não existir)
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

3. Certifique-se de que sua tabela `categories` no Supabase tenha a seguinte estrutura:

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) se necessário
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
```

## Estrutura das Services

As services seguem o padrão de classes com métodos CRUD completos:

- `create()`: Criar novo registro
- `findAll()`: Buscar todos os registros
- `findById()`: Buscar por ID
- `findByName()`: Buscar por nome (filtro)
- `update()`: Atualizar registro
- `delete()`: Deletar registro
- `count()`: Contar registros
- `findPaginated()`: Buscar com paginação

Todas as services retornam um objeto `ApiResponse<T>` com `data` e `error`.

## Hooks de Uso

Para facilitar o uso das services em componentes React, criamos hooks customizados:

```typescript
import { useCategories } from "@/shared/hooks/useCategories";

const CategoriesComponent = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const handleCreate = async () => {
    await createCategory({
      name: "Nova Categoria",
      description: "Descrição",
      color: "#FF5733",
      icon: "icon-name",
    });
  };

  // ... resto do componente
};
```
