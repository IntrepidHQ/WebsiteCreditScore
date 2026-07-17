export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dimension: string;
  dimensionColor: string;
  readTime: string;
  body: string;
  /** Byline shown on the post and used in Article JSON-LD. */
  author?: string;
  /** Rendered as an FAQ section and emitted as FAQPage JSON-LD. */
  faq?: BlogFaqItem[];
  /** Slugs of related posts, rendered as a "Related reading" section. */
  related?: string[];
}
