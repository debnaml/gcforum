import Button from "../../ui/Button";

export default function ContactPanel({ contact }) {
  return (
    <section id="contact" className="bg-white py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 rounded-3xl bg-sky px-8 py-12 md:flex-row md:items-center">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Contact</p>
          <h2 className="mt-4 heading-2 text-primary-ink">{contact.title}</h2>
          <p className="mt-4 text-lg text-primary-ink/80">{contact.description}</p>
        </div>
        <form className="flex flex-1 flex-col gap-4">
          <label className="text-sm font-semibold text-primary-ink">
            Contact Reason
            <select className="mt-2 w-full rounded-xl border border-primary/20 bg-white px-4 py-3">
              <option>Request a resource</option>
              <option>Join the forum</option>
              <option>Speak to a partner</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-primary-ink">
            Message
            <textarea rows={4} className="mt-2 w-full rounded-xl border border-primary/20 px-4 py-3" placeholder="Let us know how we can support you." />
          </label>
          <Button type="submit" className="self-start">
            Send message
          </Button>
        </form>
      </div>
    </section>
  );
}
