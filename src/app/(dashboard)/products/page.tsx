export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { desc } from 'drizzle-orm'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ research',
  researched: 'Đã có brief',
  scripted: 'Có kịch bản',
  produced: 'Có video',
  published: 'Đã đăng',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  pending: 'outline',
  researched: 'secondary',
  scripted: 'warning',
  produced: 'default',
  published: 'success',
}

export default async function ProductsPage() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kho sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý sản phẩm và brief research</p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách sản phẩm
            {allProducts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({allProducts.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allProducts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              Chưa có sản phẩm nào. Bắt đầu bằng cách thêm sản phẩm đầu tiên.
            </div>
          ) : (
            <div className="divide-y">
              {allProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.category ?? 'Chưa phân loại'} · {product.priceRange ?? 'Chưa có giá'} · {format(new Date(product.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[product.status] ?? 'outline'} className="ml-4 shrink-0">
                    {STATUS_LABELS[product.status] ?? product.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
