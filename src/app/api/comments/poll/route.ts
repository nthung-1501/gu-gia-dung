import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { publishJobs } from '@/lib/db/schema'
import { tiktokClient } from '@/lib/tiktok/client'

export async function POST() {
  try {
    const published = await db.query.publishJobs.findMany({
      where: eq(publishJobs.status, 'published'),
    })

    const postIds = published
      .map((p) => p.tiktokPostId)
      .filter((id): id is string => Boolean(id))

    if (postIds.length === 0) {
      return NextResponse.json({ message: 'Không có video nào đã publish', newComments: [] })
    }

    const processed = await db.query.commentTriggers.findMany()
    const processedIds = new Set(processed.map((t) => t.tiktokCommentId))

    const newComments: Array<{
      tiktokPostId: string
      tiktokCommentId: string
      commenterUsername: string
      commentText: string
    }> = []

    for (const postId of postIds) {
      try {
        const comments = await tiktokClient.getComments(postId)
        for (const comment of comments) {
          if (!processedIds.has(comment.id)) {
            newComments.push({
              tiktokPostId: postId,
              tiktokCommentId: comment.id,
              commenterUsername: comment.display_name,
              commentText: comment.text,
            })
          }
        }
      } catch {
        // Skip individual video errors — continue polling others
      }
    }

    return NextResponse.json({ newComments, total: newComments.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
