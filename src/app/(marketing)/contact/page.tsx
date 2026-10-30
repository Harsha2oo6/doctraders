import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { ContactForm } from "@/components/site/contact-form";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contact" title="We would like to hear from you" />
      <Section tone="white">
        <Container className="mx-auto max-w-xl"><ContactForm /></Container>
      </Section>
    </>
  );
}
