var documenterSearchIndex = {"docs":
[{"location":"explanation/","page":"How it works","title":"How it works","text":"CurrentModule = AggregateBy\nDocTestSetup = quote\n    using AggregateBy\nend","category":"page"},{"location":"explanation/#How-it-works","page":"How it works","title":"How it works","text":"","category":"section"},{"location":"explanation/","page":"How it works","title":"How it works","text":"If aggregate is some aggregation operation, then","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"julia> aggregate(By(fkey), itr)    # itr is an iterable container","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"performs aggregations of the form operation(dict[fkey(x)], x) where operation is associated with aggregate. Let's see a few more examples, this time explaining how they work.","category":"page"},{"location":"explanation/#Examples-and-their-explanation","page":"How it works","title":"Examples and their explanation","text":"","category":"section"},{"location":"explanation/","page":"How it works","title":"How it works","text":"julia> count(By(), \"Hello\")\nDict{Char, Int64} with 4 entries:\n  'H' => 1\n  'l' => 2\n  'e' => 1\n  'o' => 1","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"Here, the aggregation command is count, and the fkey in By(fkey) is the default value identity (identity(x) = x). Consequently, each character got aggregated (by counting) into a container indexed by the character itself. Counting aggregates x as dict[fkey(x)] + 1, i.e., the operation is +(<dict-entry>, 1). Note that count ignores any supplied fval.","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"To sum a list by some property of its items:","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"julia> sum(By(isodd, abs2), 1:5)\nDict{Bool, Int64} with 2 entries:\n  0 => 20\n  1 => 35","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"abs2(x::Real) just squares x, and we note that 2² + 4² == 20 (the even numbers in 1:5) and 1² + 3² + 5² == 35 (the odd numbers in 1:5). This example illustrates an important point: fkey is applied to each item to generate the key, and fval is applied to each item before excuting the aggregation operation. sum aggregates dict[fkey(x)] + fval(x).","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"A third supported aggregation is push!:","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"julia> push!(By(isodd), 1:11)\nDict{Bool, Vector{Int64}} with 2 entries:\n  0 => [2, 4, 6, 8, 10]\n  1 => [1, 3, 5, 7, 9, 11]","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"In other words, this aggregates via push!(dict[fkey(x)], fval(x)): dict[fkey(x)] returns the aggregated-list for key fkey(x), and then fval(x) is push!ed onto the list.","category":"page"},{"location":"explanation/","page":"How it works","title":"How it works","text":"If desired, you can control the key- and value-type of the returned Dict with By{K,V}(fkey, fval). This can be useful if you want to add items of a different type later, or to help performance in cases where Julia's type-inference fails (see Internals and advanced usage).","category":"page"},{"location":"advanced/#Internals-and-advanced-usage","page":"Internals","title":"Internals and advanced usage","text":"","category":"section"},{"location":"advanced/","page":"Internals","title":"Internals","text":"AggregateBy.jl's most important design goal is to be a lightweight tool that simplifies interactive analysis at the command line. However, it also tries to achieve reasonable performance, and that often means inferring the key- and value-types of the returned Dict. In detail, here is what actually happens for a ficticious aggregator (e.g., like count, sum, or push!) and \"by\" function By(fkey, fval):","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"If you call aggregator(By{K,V}(fkey, fval), itr), it should return a Dict{K,V}. It does not rely on inference.\nIf you call aggregator(By(fkey, fval), itr), it will determine whether itr has a known eltype (see Base.IteratorEltype):\nif the eltype T is known, it infers K from fkey(::T) and V from aggregator and fval(::T)\nif the eltype is unknown, it will aggregate to Dict{Any,Any} internally, and then try to \"tighten\" the eltype upon return.","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"You can use AggregateBy.UNKNOWN if you want to tighten selectively, e.g., By{UNKNOWN,Any} will tighten the keytype but not the valtype, and so on.","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"To illustrate these considerations, let's experiment with both By(fkey) and By{K,V}(fkey) in three different cases:","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"where the eltype is known and concrete (e.g., Vector{Int})\nwhere the eltype is known and abstract (e.g., Vector{Any})\nwhere the eltype is unknown","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"For the third case, it will help if we define a custom container type:","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"struct UnknownEltype\n    container\nend\n\nBase.IteratorEltype(::Type{UnknownEltype}) = Base.EltypeUnknown()\n\nBase.iterate(u::UnknownEltype) = iterate(u.container)\nBase.iterate(u::UnknownEltype, s) = iterate(u.container, s)","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"Now, let's set up the data we need for benchmarking:","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"julia> by1 = By{Bool,Int}(isodd)\nBy{Bool, Int64, typeof(isodd)}(isodd)\n\njulia> by2 = By(isodd)\nBy{AggregateBy.UNKNOWN, AggregateBy.UNKNOWN, typeof(isodd)}(isodd)\n\njulia> vconcrete = collect(1:11);    # Vector{Int}\n\njulia> vabstract = Any[(1:11)...];   # Vector{Any}\n\njulia> vunknown = UnknownEltype(vconcrete);    # unknown eltype","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"On the author's machine,","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"julia> using BenchmarkTools\n\njulia> @btime sum($by, $v);   # supply either by1 or by2, and either vconcrete, vabstract, or vunknown","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"yields the following results:","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"Container By{K,V}(fkey) By(fkey)\nvconcrete 150.153 ns (4 allocations: 432 bytes) 150.652 ns (4 allocations: 432 bytes)\nvabstract 343.598 ns (4 allocations: 432 bytes) 906.775 ns (4 allocations: 512 bytes)\nvunknown 861.281 ns (26 allocations: 960 bytes) 1.327 μs (30 allocations: 1.44 KiB)","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"In the vunknown row, much of the cost in the By{K,V}(fkey) case is due to the unknown type of vunknown.container; the alternative definition","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"struct UnknownEltype2\n    container::Vector{Int}\nend\nBase.IteratorEltype(::Type{UnknownEltype}) = Base.EltypeUnknown()","category":"page"},{"location":"advanced/","page":"Internals","title":"Internals","text":"yields substantially better performance (302.490 ns (4 allocations: 432 bytes)). The By(fkey) case improves less dramatically (1.039 μs (8 allocations: 944 bytes)).","category":"page"},{"location":"reference/#AggregateBy","page":"Reference","title":"AggregateBy","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"Documentation for AggregateBy.","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Currently supported operations:","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"count\nsum\npush!\nminimum\nmaximum","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Modules = [AggregateBy]","category":"page"},{"location":"reference/#AggregateBy.By-Tuple","page":"Reference","title":"AggregateBy.By","text":"By(fkey=identity, fval=identity)\nBy{K,V}(fkey=identity, fval=identity)\n\nBy creates an object that triggers \"key-selective\" operations on a collection. fkey(item) generates the key (i.e., the aggregation target), and fval(item) gets used in the aggregation operation.\n\nThe return value is typically a Dict. Optionally, you can specify the key K and value V types of that Dict, which can help performance in certain cases (see the documentation for details).\n\nExamples\n\njulia> count(By(lowercase), \"Hello\")\nDict{Char, Int64} with 4 entries:\n  'h' => 1\n  'l' => 2\n  'e' => 1\n  'o' => 1\n\njulia> push!(By(isodd), 1:11)\nDict{Bool, Vector{Int64}} with 2 entries:\n  0 => [2, 4, 6, 8, 10]\n  1 => [1, 3, 5, 7, 9, 11]\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = AggregateBy\nDocTestSetup = quote\n    using AggregateBy\nend","category":"page"},{"location":"#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package is not yet registered, so you'll have to enter package mode with ] and then:","category":"page"},{"location":"","page":"Home","title":"Home","text":"(@v1.10) pkg> dev https://github.com/timholy/AggregateBy.jl","category":"page"},{"location":"#Tutorial","page":"Home","title":"Tutorial","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"These examples assume that you've executed using AggregateBy in the current session.","category":"page"},{"location":"","page":"Home","title":"Home","text":"To count all the letters in a string, ignoring case, use","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> count(By(lowercase), \"HelLo\")\nDict{Char, Int64} with 4 entries:\n  'h' => 1\n  'l' => 2\n  'e' => 1\n  'o' => 1","category":"page"},{"location":"","page":"Home","title":"Home","text":"To collect similar items, use push!:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> push!(By(isodd, x -> -x), 1:11)\nDict{Bool, Vector{Int64}} with 2 entries:\n  0 => [-2, -4, -6, -8, -10]\n  1 => [-1, -3, -5, -7, -9, -11]","category":"page"}]
}
