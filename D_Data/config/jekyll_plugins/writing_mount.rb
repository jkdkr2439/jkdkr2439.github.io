# Prefix canonical root-owned media references only in the ephemeral Writing output.
Jekyll::Hooks.register [:posts, :pages], :post_render do |document|
  baseurl = document.site.config["baseurl"].to_s.sub(%r{/$}, "")
  next if baseurl.empty? || !document.output_ext.eql?(".html")

  document.output.gsub!(%r{(["'])/assets/}, "\\1#{baseurl}/assets/")
end
