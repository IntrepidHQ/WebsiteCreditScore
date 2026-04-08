import { saveTemplateAction } from "@/app/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWorkspaceDashboardContext } from "@/lib/product/context";

export default async function TemplatesPage() {
  const { dashboard } = await getWorkspaceDashboardContext();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Reusable outreach</p>
          <CardTitle className="mt-2 text-4xl">Saved templates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {dashboard.templates.map((template) => (
            <form action={saveTemplateAction} className="grid gap-3 rounded-[10px] border border-border/70 bg-background-alt/60 p-4" key={template.id}>
              <input name="id" type="hidden" value={template.id} />
              <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Template name
                  <Input defaultValue={template.name} name="name" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Subject
                  <Input defaultValue={template.subject} name="subject" />
                </label>
              </div>
              <input name="kind" type="hidden" value={template.kind} />
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Body
                <textarea
                  className="min-h-40 rounded-[8px] border border-border/70 bg-panel/80 px-3 py-3 text-sm text-foreground outline-none focus:border-accent/40"
                  defaultValue={template.body}
                  name="body"
                />
              </label>
              <div className="flex justify-end">
                <Button size="sm" type="submit" variant="secondary">
                  Save template
                </Button>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.24em] text-accent">Add another</p>
          <CardTitle className="mt-2 text-4xl">New template</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveTemplateAction} className="grid gap-3">
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Name
              <Input name="name" placeholder="Proposal nudge" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Kind
              <select
                className="h-11 rounded-[8px] border border-border/70 bg-panel/80 px-3 text-sm text-foreground"
                defaultValue="proposal"
                name="kind"
              >
                <option value="intro">Intro</option>
                <option value="follow-up">Follow-up</option>
                <option value="proposal">Proposal</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Subject
              <Input name="subject" placeholder="Quick follow-up on the site review" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Body
              <textarea
                className="min-h-40 rounded-[8px] border border-border/70 bg-panel/80 px-3 py-3 text-sm text-foreground outline-none focus:border-accent/40"
                name="body"
                placeholder="Wanted to follow up on the packet I sent over..."
              />
            </label>
            <Button type="submit">Save template</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
